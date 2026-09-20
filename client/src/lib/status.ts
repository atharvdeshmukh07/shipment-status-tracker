import type { Stage } from '../api/types'

// The API speaks in constants. Nobody at a desk says "OUT_FOR_DELIVERY".
export const STAGE_LABEL: Record<Stage, string> = {
  BOOKED: 'Booked',
  DOCS_RECEIVED: 'Docs received',
  IN_TRANSIT: 'In transit',
  ARRIVED_AT_PORT: 'At port',
  CUSTOMS_FILED: 'BE filed',
  CUSTOMS_HOLD: 'Customs hold',
  CLEARED: 'Cleared',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  EXCEPTION: 'Exception',
  CANCELLED: 'Cancelled',
}

// Held and broken files have to be findable scanning down a long list.
// Everything moving along normally stays quiet, on purpose.
export const STAGE_TONE: Record<Stage, string> = {
  BOOKED: 'bg-slate-100 text-slate-700 border-slate-200',
  DOCS_RECEIVED: 'bg-slate-100 text-slate-700 border-slate-200',
  IN_TRANSIT: 'bg-sky-50 text-sky-700 border-sky-200',
  ARRIVED_AT_PORT: 'bg-sky-50 text-sky-700 border-sky-200',
  CUSTOMS_FILED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  CUSTOMS_HOLD: 'bg-amber-50 text-amber-800 border-amber-300',
  CLEARED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OUT_FOR_DELIVERY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  EXCEPTION: 'bg-red-50 text-red-700 border-red-300',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
}

// The run a file is supposed to make. Hold, exception and cancelled are
// deliberately not on it — nobody plans a shipment through them, they are
// places it gets stuck or stops, so they are called out against the line
// rather than drawn as extra steps on it.
export const TRACK_LINE: Stage[] = [
  'BOOKED',
  'DOCS_RECEIVED',
  'IN_TRANSIT',
  'ARRIVED_AT_PORT',
  'CUSTOMS_FILED',
  'CLEARED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

// Shorter than STAGE_LABEL. Eight of these sit side by side and the full words
// either wrap badly or push the last one off the edge.
export const TRACK_LABEL: Record<Stage, string> = {
  BOOKED: 'Booked',
  DOCS_RECEIVED: 'Docs',
  IN_TRANSIT: 'Transit',
  ARRIVED_AT_PORT: 'At port',
  CUSTOMS_FILED: 'BE filed',
  CUSTOMS_HOLD: 'Hold',
  CLEARED: 'Cleared',
  OUT_FOR_DELIVERY: 'Out',
  DELIVERED: 'Delivered',
  EXCEPTION: 'Exception',
  CANCELLED: 'Cancelled',
}

// A left edge on the rows somebody has to actually do something about. The
// badge still carries the word, so this is a second cue rather than the only
// one — colour on its own is no use to half the desk.
export const STAGE_EDGE: Partial<Record<Stage, string>> = {
  CUSTOMS_HOLD: 'border-l-amber-400',
  EXCEPTION: 'border-l-red-400',
}

// Has to match the server. Moving to either of these without a reason is
// rejected there too — this only saves the round trip.
export const NEEDS_REMARKS: Stage[] = ['CUSTOMS_HOLD', 'EXCEPTION']
