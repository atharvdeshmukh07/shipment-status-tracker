import { describe, expect, it } from 'vitest'
import { escapeLike, referenceKey } from './reference.js'

describe('referenceKey', () => {
  it('treats the punctuation as noise', () => {
    const key = referenceKey('NGK/IMP/2026/0431')
    expect(key).toBe('NGKIMP20260431')
    expect(referenceKey('ngk-imp-2026-0431')).toBe(key)
    expect(referenceKey(' NGK imp/2026/0431 ')).toBe(key)
  })

  it('still tells two files apart', () => {
    expect(referenceKey('NGK/IMP/2026/0431')).not.toBe(referenceKey('NGK/IMP/2026/0432'))
  })
})

describe('escapeLike', () => {
  it('defuses the wildcards', () => {
    expect(escapeLike('NGK_IMP')).toBe('NGK\\_IMP')
    expect(escapeLike('50%')).toBe('50\\%')
    expect(escapeLike('a\\b')).toBe('a\\\\b')
  })

  it('leaves everything else alone', () => {
    expect(escapeLike('NGK/IMP/2026')).toBe('NGK/IMP/2026')
  })
})
