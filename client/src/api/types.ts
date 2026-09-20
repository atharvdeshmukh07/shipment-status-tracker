export type Stage =
  | 'BOOKED'
  | 'DOCS_RECEIVED'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_PORT'
  | 'CUSTOMS_FILED'
  | 'CUSTOMS_HOLD'
  | 'CLEARED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXCEPTION'
  | 'CANCELLED'

export type Mode = 'SEA_FCL' | 'SEA_LCL' | 'AIR'

export type Shipment = {
  id: string
  referenceNo: string
  houseBlNo: string | null
  masterBlNo: string | null
  mode: Mode
  originPort: string
  destinationPort: string
  consignee: string
  incoterm: string | null
  currentStatus: Stage
  eta: string | null
  version: number
  createdAt: string
  updatedAt: string
}

// The detail endpoint adds the moves that are legal from where this file
// currently sits, so the dropdown never offers one the server will refuse.
export type ShipmentDetail = Shipment & { nextStatuses: Stage[] }

export type ShipmentEvent = {
  id: number
  fromStatus: Stage | null
  toStatus: Stage
  remarks: string | null
  actor: string
  occurredAt: string
}

export type ListResponse = {
  data: Shipment[]
  pagination: { total: number; limit: number; offset: number }
}
