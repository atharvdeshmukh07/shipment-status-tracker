import type { ShipmentEvent } from '@prisma/client'

// The list query asks Postgres for the ETA as text, findUnique hands back a
// Date at UTC midnight. Both end up as YYYY-MM-DD here. Never run it through
// toLocaleDateString — that is what shifts a delivery due on the 14th to the
// 13th for anyone sitting west of us.
function dateOnly(value: Date | string | null): string | null {
  if (!value) return null
  if (typeof value === 'string') return value.slice(0, 10)
  return value.toISOString().slice(0, 10)
}

export type ShipmentRow = {
  id: string
  referenceNo: string
  houseBlNo: string | null
  masterBlNo: string | null
  mode: string
  originPort: string
  destinationPort: string
  consignee: string
  incoterm: string | null
  currentStatus: string
  eta: Date | string | null
  version: number
  createdAt: Date
  updatedAt: Date
}

// referenceKey deliberately does not go out. It is a matching aid, not
// something anyone should be storing or displaying.
export function presentShipment(row: ShipmentRow) {
  return {
    id: row.id,
    referenceNo: row.referenceNo,
    houseBlNo: row.houseBlNo,
    masterBlNo: row.masterBlNo,
    mode: row.mode,
    originPort: row.originPort,
    destinationPort: row.destinationPort,
    consignee: row.consignee,
    incoterm: row.incoterm,
    currentStatus: row.currentStatus,
    eta: dateOnly(row.eta),
    version: row.version,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function presentEvent(row: ShipmentEvent) {
  return {
    id: row.id,
    fromStatus: row.fromStatus,
    toStatus: row.toStatus,
    remarks: row.remarks,
    actor: row.actor,
    occurredAt: row.occurredAt.toISOString(),
  }
}
