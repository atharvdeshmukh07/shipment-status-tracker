import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { ZodError } from "zod";
import { prisma } from "./db.js";
import { env } from "./env.js";
import { ApiError } from "./errors.js";
import { shipmentRoutes } from "./shipments/routes.js";

const app = express();

// Vercel gives every deployment its own hostname, so an allowlist holding only
// the production URL blocks every preview build. No origin header at all means
// curl or Render's health check, which is fine.
const previewHost = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

app.use(
  cors({
    origin(origin, allow) {
      if (!origin) return allow(null, true);
      if (env.corsOrigins.includes(origin)) return allow(null, true);
      if (env.allowVercelPreviews && previewHost.test(origin))
        return allow(null, true);
      allow(null, false);
    },
  })
);

app.use(express.json({ limit: "100kb" }));

// Render pings this. Keep it cheap, but do touch the database — a process that
// is up while Postgres is unreachable is not actually healthy.
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`select 1`;
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false, db: "unreachable" });
  }
});
// Anyone handed this URL pastes it into a browser before anything else. A 404
// there reads as broken even though it isn't, so point them at what exists.
app.get("/", (_req, res) => {
  res.json({
    service: "shipment-status-tracker-api",
    health: "/health",
    shipments: "/api/v1/shipments",
  });
});

app.use("/api/v1/shipments", shipmentRoutes);

app.use((_req, res) => {
  res
    .status(404)
    .json({ error: { code: "NOT_FOUND", message: "nothing at that path" } });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        code: "VALIDATION_FAILED",
        message: "some fields did not come through right",
        details: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  // Anything down here is a bug, so the client gets nothing useful and the log
  // gets everything.
  console.error(err);
  res.status(500).json({
    error: { code: "INTERNAL", message: "something broke on our side" },
  });
});

app.listen(env.port, () => {
  console.log(`api listening on :${env.port}`);
});
