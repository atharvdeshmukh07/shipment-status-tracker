// ETAs come back as plain YYYY-MM-DD. Parsing one into a Date and formatting it
// shifts a delivery due on the 14th to the 13th for anyone sitting west of UTC,
// so this only ever slices the string.
export function shortDate(value: string | null): string {
  if (!value) return '—'
  const parts = value.slice(0, 10).split('-')
  if (parts.length !== 3) return value
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

// Whole days between today and the ETA, both taken as plain dates. Working in
// milliseconds from a timestamp makes something due tomorrow read as due today
// depending on what time of day you happen to look at it.
export function daysUntil(value: string | null): number | null {
  if (!value) return null
  const target = Date.parse(`${value.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(target)) return null
  const now = new Date()
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.round((target - today) / 86_400_000)
}

// A date on its own does not tell anybody whether to worry about it.
export function etaNote(value: string | null): string | null {
  const days = daysUntil(value)
  if (days === null) return null
  if (days === 0) return 'due today'
  if (days === 1) return 'due tomorrow'
  if (days > 1) return `in ${days} days`
  if (days === -1) return '1 day late'
  return `${Math.abs(days)} days late`
}

// How long a file has been sitting where it is. The thing an ops desk actually
// wants to know is not when it moved, it is how long it has not moved.
export function sinceNote(value: string): string {
  const then = Date.parse(value)
  if (Number.isNaN(then)) return ''
  const hours = Math.floor((Date.now() - then) / 3_600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours} hours`
  const days = Math.floor(hours / 24)
  return days === 1 ? '1 day' : `${days} days`
}

// Event timestamps are real moments in time, so these do get localised.
export function whenStamp(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
