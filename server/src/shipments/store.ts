import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { ApiError } from "../errors.js";
import { escapeLike, referenceKey } from "../domain/reference.js";
import {
  IllegalMove,
  assertMove,
  legalNextStatuses,
  type Stage,
} from "../domain/status.js";
import type { ShipmentRow } from "./present.js";
import type { ListQuery, NewShipment, StatusChange } from "./schemas.js";

function isDuplicateKey(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "P2002"
  );
}

export async function createShipment(input: NewShipment) {
  const startsAt: Stage = input.status ?? "BOOKED";

  try {
    return await prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          referenceNo: input.referenceNo,
          referenceKey: referenceKey(input.referenceNo),
          houseBlNo: input.houseBlNo ?? null,
          masterBlNo: input.masterBlNo ?? null,
          mode: input.mode,
          originPort: input.originPort,
          destinationPort: input.destinationPort,
          consignee: input.consignee,
          incoterm: input.incoterm ?? null,
          currentStatus: startsAt,
          eta: input.eta ? new Date(`${input.eta}T00:00:00Z`) : null,
        },
      });

      await tx.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          fromStatus: null,
          toStatus: startsAt,
          remarks: input.remarks ?? null,
        },
      });

      return shipment;
    });
  } catch (err) {
    if (isDuplicateKey(err)) {
      throw new ApiError(
        "DUPLICATE_REFERENCE",
        `${input.referenceNo} is already on the book`
      );
    }
    throw err;
  }
}

const sortColumn = {
  created_at: Prisma.sql`s.created_at`,
  eta: Prisma.sql`s.eta`,
  reference_no: Prisma.sql`s.reference_no`,
} as const;

export async function listShipments(query: ListQuery) {
  const filters: Prisma.Sql[] = [Prisma.sql`TRUE`];

  if (query.status) {
    filters.push(Prisma.sql`s.current_status = ${query.status}`);
  }

  if (query.q) {
    const prefix = `${escapeLike(referenceKey(query.q))}%`;
    filters.push(
      Prisma.sql`(s.reference_key LIKE ${prefix} ESCAPE '\\' OR upper(s.house_bl_no) LIKE ${prefix} ESCAPE '\\')`
    );
  }

  const where = Prisma.join(filters, " AND ");
  const direction = query.dir === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;

  const rows = await prisma.$queryRaw<ShipmentRow[]>`
    SELECT s.id,
           s.reference_no                        AS "referenceNo",
           s.house_bl_no                         AS "houseBlNo",
           s.master_bl_no                        AS "masterBlNo",
           s.mode,
           s.origin_port                         AS "originPort",
           s.destination_port                    AS "destinationPort",
           s.consignee,
           s.incoterm,
           s.current_status                      AS "currentStatus",
           to_char(s.eta, 'YYYY-MM-DD')          AS "eta",
           s.version,
           s.created_at                          AS "createdAt",
           s.updated_at                          AS "updatedAt"
      FROM shipments s
     WHERE ${where}
     ORDER BY ${sortColumn[query.sort]} ${direction}, s.id DESC
     LIMIT ${query.limit} OFFSET ${query.offset}
  `;

  const tally = await prisma.$queryRaw<{ total: number }[]>`
    SELECT count(*)::int AS total FROM shipments s WHERE ${where}
  `;

  return {
    rows,
    total: tally[0]?.total ?? 0,
  };
}

export async function findShipment(id: string) {
  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) throw new ApiError("NOT_FOUND", "no shipment with that id");
  return shipment;
}

export async function listEvents(id: string) {
  await findShipment(id);
  return prisma.shipmentEvent.findMany({
    where: { shipmentId: id },
    orderBy: [{ occurredAt: "asc" }, { id: "asc" }],
  });
}

type Tx = Prisma.TransactionClient;

async function brokeOutOf(tx: Tx, shipmentId: string): Promise<Stage | null> {
  const breakage = await tx.shipmentEvent.findFirst({
    where: { shipmentId, toStatus: "EXCEPTION" },
    orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
    select: { fromStatus: true },
  });
  return (breakage?.fromStatus as Stage | undefined) ?? null;
}

export async function nextStatusesFor(shipment: {
  id: string;
  currentStatus: string;
}) {
  const from = shipment.currentStatus as Stage;
  if (from !== "EXCEPTION") return legalNextStatuses(from);
  return legalNextStatuses(from, await brokeOutOf(prisma, shipment.id));
}

export async function moveShipment(id: string, change: StatusChange) {
  return prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.findUnique({ where: { id } });
    if (!shipment) throw new ApiError("NOT_FOUND", "no shipment with that id");

    const from = shipment.currentStatus as Stage;
    const fallback = from === "EXCEPTION" ? await brokeOutOf(tx, id) : null;

    try {
      assertMove(from, change.toStatus, fallback);
    } catch (err) {
      if (err instanceof IllegalMove) {
        throw new ApiError("ILLEGAL_TRANSITION", err.message, {
          from: err.from,
          to: err.to,
          allowed: err.allowed,
        });
      }
      throw err;
    }

    const moved = await tx.shipment.updateMany({
      where: { id, version: change.expectedVersion },
      data: { currentStatus: change.toStatus, version: { increment: 1 } },
    });

    if (moved.count === 0) {
      throw new ApiError(
        "VERSION_CONFLICT",
        "someone else moved this file while you had it open",
        {
          currentStatus: shipment.currentStatus,
          version: shipment.version,
        }
      );
    }

    await tx.shipmentEvent.create({
      data: {
        shipmentId: id,
        fromStatus: from,
        toStatus: change.toStatus,
        remarks: change.remarks ?? null,
      },
    });

    return tx.shipment.findUniqueOrThrow({ where: { id } });
  });
}
