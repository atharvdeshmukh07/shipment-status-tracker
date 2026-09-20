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

// Shorter than STAGE_LABEL. Eight of these sit side by side, and the full words
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

// Held and broken files have to be findable scanning down a long list, and
// everything moving normally stays quiet on purpose. The dark steps are chosen
// against the dark surface rather than being the light ones dimmed — a tint at
// low opacity plus a lighter text step, because the pale fills that work on
// paper turn into glowing blocks on a dark screen.
export const STAGE_TONE: Record<Stage, string> = {
  BOOKED:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-400/10 dark:text-slate-300 dark:border-slate-400/30',
  DOCS_RECEIVED:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-400/10 dark:text-slate-300 dark:border-slate-400/30',
  IN_TRANSIT:
    'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/40',
  ARRIVED_AT_PORT:
    'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/40',
  CUSTOMS_FILED:
    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/40',
  CUSTOMS_HOLD:
    'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/45',
  CLEARED:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40',
  OUT_FOR_DELIVERY:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40',
  DELIVERED:
    'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/50',
  EXCEPTION:
    'bg-red-50 text-red-700 border-red-300 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/45',
  CANCELLED:
    'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30',
}

// A left edge on the rows somebody has to actually do something about. The
// badge still carries the word, so this is a second cue rather than the only
// one — colour on its own is no use to a chunk of the desk.
export const STAGE_EDGE: Partial<Record<Stage, string>> = {
  CUSTOMS_HOLD: 'border-l-amber-400',
  EXCEPTION: 'border-l-red-400',
}

// Has to match the server. Moving to either of these without a reason is
// rejected there too — this only saves the round trip.
export const NEEDS_REMARKS: Stage[] = ['CUSTOMS_HOLD', 'EXCEPTION']
