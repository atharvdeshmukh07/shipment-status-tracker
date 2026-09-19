export const STAGES = [
  'BOOKED',
  'DOCS_RECEIVED',
  'IN_TRANSIT',
  'ARRIVED_AT_PORT',
  'CUSTOMS_FILED',
  'CUSTOMS_HOLD',
  'CLEARED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'EXCEPTION',
  'CANCELLED',
] as const

export type Stage = (typeof STAGES)[number]

// Where a shipment can go from each stage. EXCEPTION is empty on purpose:
// it goes back to whatever it broke out of, which only the event log knows.
// See legalNextStatuses.
const onward: Record<Stage, readonly Stage[]> = {
  BOOKED: ['DOCS_RECEIVED', 'CANCELLED', 'EXCEPTION'],
  DOCS_RECEIVED: ['IN_TRANSIT', 'CANCELLED', 'EXCEPTION'],
  IN_TRANSIT: ['ARRIVED_AT_PORT', 'EXCEPTION'],
  ARRIVED_AT_PORT: ['CUSTOMS_FILED', 'EXCEPTION'],
  CUSTOMS_FILED: ['CUSTOMS_HOLD', 'CLEARED', 'EXCEPTION'],
  CUSTOMS_HOLD: ['CUSTOMS_FILED', 'CLEARED', 'EXCEPTION'],
  CLEARED: ['OUT_FOR_DELIVERY', 'EXCEPTION'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'EXCEPTION'],
  DELIVERED: [],
  CANCELLED: [],
  EXCEPTION: [],
}

// A hold or a break needs a reason written down, otherwise the desk has to
// ring someone to find out what happened.
export const NEEDS_REMARKS: readonly Stage[] = ['CUSTOMS_HOLD', 'EXCEPTION']

export function isStage(value: unknown): value is Stage {
  return typeof value === 'string' && (STAGES as readonly string[]).includes(value)
}

export function isTerminal(stage: Stage): boolean {
  return stage === 'DELIVERED' || stage === 'CANCELLED'
}

// brokeOutOf is the from_status of the most recent event that moved this
// shipment into EXCEPTION. Callers only need to look it up when the shipment
// is actually sitting in EXCEPTION, so the normal path stays one query.
export function legalNextStatuses(current: Stage, brokeOutOf?: Stage | null): Stage[] {
  if (current !== 'EXCEPTION') return [...onward[current]]
  return brokeOutOf ? [brokeOutOf, 'CANCELLED'] : ['CANCELLED']
}

export function canMove(current: Stage, target: Stage, brokeOutOf?: Stage | null): boolean {
  return legalNextStatuses(current, brokeOutOf).includes(target)
}

export class IllegalMove extends Error {
  readonly from: Stage
  readonly to: Stage
  readonly allowed: Stage[]

  constructor(from: Stage, to: Stage, allowed: Stage[]) {
    super(
      allowed.length === 0
        ? `${from} is a closed file, nothing follows it`
        : `cannot go ${from} -> ${to}, only ${allowed.join(', ')}`,
    )
    this.name = 'IllegalMove'
    this.from = from
    this.to = to
    this.allowed = allowed
  }
}

export function assertMove(current: Stage, target: Stage, brokeOutOf?: Stage | null): void {
  const allowed = legalNextStatuses(current, brokeOutOf)
  if (!allowed.includes(target)) throw new IllegalMove(current, target, allowed)
}
