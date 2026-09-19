import { Router } from "express";
import { presentEvent, presentShipment } from "./present.js";
import { idParam, listQuery, newShipment } from "./schemas.js";
import { legalNextStatuses, type Stage } from "../domain/status.js";
import {
  createShipment,
  findShipment,
  listEvents,
  listShipments,
} from "./store.js";

export const shipmentRoutes = Router();

// Express 5 passes a rejected promise to the error handler on its own, so the
// handlers below stay free of try/catch that does nothing but rethrow.

shipmentRoutes.post("/", async (req, res) => {
  const body = newShipment.parse(req.body);
  const created = await createShipment(body);
  res.status(201).json(presentShipment(created));
});

shipmentRoutes.get("/", async (req, res) => {
  const query = listQuery.parse(req.query);
  const { rows, total } = await listShipments(query);

  res.json({
    data: rows.map(presentShipment),
    pagination: { total, limit: query.limit, offset: query.offset },
  });
});

shipmentRoutes.get("/:id", async (req, res) => {
  const { id } = idParam.parse(req.params);
  const shipment = await findShipment(id);

  // The dropdown on the detail page is built from this, so the UI never offers
  // a move the server is only going to refuse.
  const from = shipment.currentStatus as Stage;
  res.json({
    ...presentShipment(shipment),
    nextStatuses: legalNextStatuses(from),
  });
});

shipmentRoutes.get("/:id/events", async (req, res) => {
  const { id } = idParam.parse(req.params);
  const events = await listEvents(id);
  res.json({ data: events.map(presentEvent) });
});
