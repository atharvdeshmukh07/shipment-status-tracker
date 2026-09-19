import { describe, expect, it } from 'vitest'
import {
  IllegalMove,
  STAGES,
  assertMove,
  canMove,
  isStage,
  isTerminal,
  legalNextStatuses,
} from './status.js'

describe('the normal run of a file', () => {
  it('walks booking through to delivery', () => {
    const run = [
      ['BOOKED', 'DOCS_RECEIVED'],
      ['DOCS_RECEIVED', 'IN_TRANSIT'],
      ['IN_TRANSIT', 'ARRIVED_AT_PORT'],
      ['ARRIVED_AT_PORT', 'CUSTOMS_FILED'],
      ['CUSTOMS_FILED', 'CLEARED'],
      ['CLEARED', 'OUT_FOR_DELIVERY'],
      ['OUT_FOR_DELIVERY', 'DELIVERED'],
    ] as const

    for (const [from, to] of run) {
      expect(canMove(from, to), `${from} -> ${to}`).toBe(true)
    }
  })

  it('will not let a file skip ahead', () => {
    expect(canMove('BOOKED', 'DELIVERED')).toBe(false)
    expect(canMove('IN_TRANSIT', 'CLEARED')).toBe(false)
    expect(canMove('ARRIVED_AT_PORT', 'OUT_FOR_DELIVERY')).toBe(false)
  })

  it('will not let a file go backwards, apart from the customs loop', () => {
    expect(canMove('IN_TRANSIT', 'BOOKED')).toBe(false)
    expect(canMove('CLEARED', 'CUSTOMS_FILED')).toBe(false)
    expect(canMove('CUSTOMS_HOLD', 'CUSTOMS_FILED')).toBe(true)
  })

  it('rejects a move to the stage it is already on', () => {
    for (const stage of STAGES) {
      expect(canMove(stage, stage), `${stage} -> itself`).toBe(false)
    }
  })
})

describe('customs hold', () => {
  it('can go back for another filing or straight to cleared', () => {
    expect(legalNextStatuses('CUSTOMS_HOLD')).toEqual(['CUSTOMS_FILED', 'CLEARED', 'EXCEPTION'])
  })

  it('is reachable from a filing and nowhere else', () => {
    const reachesHold = STAGES.filter((stage) => canMove(stage, 'CUSTOMS_HOLD'))
    expect(reachesHold).toEqual(['CUSTOMS_FILED'])
  })
})

describe('cancellation', () => {
  it('is only on the table before the cargo moves', () => {
    expect(canMove('BOOKED', 'CANCELLED')).toBe(true)
    expect(canMove('DOCS_RECEIVED', 'CANCELLED')).toBe(true)
    expect(canMove('IN_TRANSIT', 'CANCELLED')).toBe(false)
    expect(canMove('CUSTOMS_HOLD', 'CANCELLED')).toBe(false)
  })
})

describe('closed files', () => {
  it('accept nothing further', () => {
    expect(legalNextStatuses('DELIVERED')).toEqual([])
    expect(legalNextStatuses('CANCELLED')).toEqual([])
    expect(isTerminal('DELIVERED')).toBe(true)
    expect(isTerminal('CANCELLED')).toBe(true)
    expect(isTerminal('CUSTOMS_HOLD')).toBe(false)
  })

  it('say so when you try anyway', () => {
    expect(() => assertMove('DELIVERED', 'OUT_FOR_DELIVERY')).toThrow(/closed file/)
  })
})

describe('exceptions', () => {
  it('can be raised from anything still moving', () => {
    const canBreak = STAGES.filter((stage) => canMove(stage, 'EXCEPTION'))
    expect(canBreak).toEqual([
      'BOOKED',
      'DOCS_RECEIVED',
      'IN_TRANSIT',
      'ARRIVED_AT_PORT',
      'CUSTOMS_FILED',
      'CUSTOMS_HOLD',
      'CLEARED',
      'OUT_FOR_DELIVERY',
    ])
  })

  it('go back to the stage they broke out of', () => {
    expect(legalNextStatuses('EXCEPTION', 'CUSTOMS_FILED')).toEqual(['CUSTOMS_FILED', 'CANCELLED'])
    expect(canMove('EXCEPTION', 'CUSTOMS_FILED', 'CUSTOMS_FILED')).toBe(true)
    expect(canMove('EXCEPTION', 'BOOKED', 'CUSTOMS_FILED')).toBe(false)
  })

  it('raised from a booking can still be cancelled', () => {
    expect(legalNextStatuses('EXCEPTION', 'BOOKED')).toEqual(['BOOKED', 'CANCELLED'])
  })

  // The creation event is the only one with a null from_status and it never
  // targets EXCEPTION, so this should not happen. Pinned so a later change to
  // the event writer cannot quietly strand a file.
  it('with nothing to go back to can only be cancelled', () => {
    expect(legalNextStatuses('EXCEPTION', null)).toEqual(['CANCELLED'])
    expect(legalNextStatuses('EXCEPTION')).toEqual(['CANCELLED'])
  })
})

describe('the stage list itself', () => {
  it('has an entry for every stage', () => {
    for (const stage of STAGES) {
      expect(() => legalNextStatuses(stage), stage).not.toThrow()
    }
  })

  it('never points at a stage that does not exist', () => {
    for (const stage of STAGES) {
      for (const next of legalNextStatuses(stage)) {
        expect(isStage(next), `${stage} -> ${next}`).toBe(true)
      }
    }
  })

  it('rejects anything that is not a stage', () => {
    expect(isStage('PENDING')).toBe(false)
    expect(isStage('delivered')).toBe(false)
    expect(isStage(7)).toBe(false)
    expect(isStage(undefined)).toBe(false)
  })
})

describe('IllegalMove', () => {
  it('carries what was allowed, so the API can hand it to the client', () => {
    try {
      assertMove('IN_TRANSIT', 'DELIVERED')
      expect.unreachable('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(IllegalMove)
      const move = err as IllegalMove
      expect(move.from).toBe('IN_TRANSIT')
      expect(move.to).toBe('DELIVERED')
      expect(move.allowed).toEqual(['ARRIVED_AT_PORT', 'EXCEPTION'])
    }
  })
})
