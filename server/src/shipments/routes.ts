import { Router } from "express";
import { presentEvent, presentShipment } from "./present.js";
import { idParam, listQuery, newShipment, statusChange } from "./schemas.js";
import {
  createShipment,
  findShipment,
  listEvents,
  listShipments,
  moveShipment,
  nextStatusesFor,
} from "./store.js";

export const shipmentRoutes = Router();

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

  res.json({
    ...presentShipment(shipment),
    nextStatuses: await nextStatusesFor(shipment),
  });
});

shipmentRoutes.get("/:id/events", async (req, res) => {
  const { id } = idParam.parse(req.params);
  const events = await listEvents(id);
  res.json({ data: events.map(presentEvent) });
});

shipmentRoutes.post("/:id/status", async (req, res) => {
  const { id } = idParam.parse(req.params);
  const change = statusChange.parse(req.body);
  const moved = await moveShipment(id, change);
  res.json(presentShipment(moved));
});
