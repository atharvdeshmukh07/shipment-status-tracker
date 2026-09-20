import { ApiError } from '../api/client'
import type { Stage } from '../api/types'
import { STAGE_LABEL } from '../lib/status'

type FieldIssue = { field: string; message: string }

function asFieldIssues(details: unknown): FieldIssue[] | null {
  if (!Array.isArray(details)) return null
  const everyOne = details.every(
    (item) =>
      typeof item === 'object' && item !== null && typeof (item as FieldIssue).field === 'string',
  )
  return everyOne ? (details as FieldIssue[]) : null
}

function asTransition(details: unknown): { from: Stage; allowed: Stage[] } | null {
  if (typeof details !== 'object' || details === null) return null
  const maybe = details as { from?: Stage; allowed?: Stage[] }
  if (!maybe.from || !Array.isArray(maybe.allowed)) return null
  return { from: maybe.from, allowed: maybe.allowed }
}

// Four different things go wrong here and they mean four different things to
// whoever is at the desk. Collapsing them into "something went wrong" throws
// away the only genuinely useful part of the response.
function explain(error: ApiError) {
  if (error.code === 'ILLEGAL_TRANSITION') {
    const move = asTransition(error.details)
    if (move) {
      return (
        <>
          <p>That move is not allowed from here.</p>
          <p className="mt-1">
            From {STAGE_LABEL[move.from]} this file can go to:{' '}
            {move.allowed.length === 0
              ? 'nowhere — it is closed'
              : move.allowed.map((stage) => STAGE_LABEL[stage]).join(', ')}
          </p>
        </>
      )
    }
  }

  if (error.code === 'VERSION_CONFLICT') {
    return (
      <p>
        Someone else moved this file while you had it open. Reload to see where it actually is
        before trying again.
      </p>
    )
  }

  if (error.code === 'VALIDATION_FAILED') {
    const issues = asFieldIssues(error.details)
    if (issues) {
      return (
        <ul className="list-inside list-disc">
          {issues.map((issue) => (
            <li key={issue.field}>
              {issue.field}: {issue.message}
            </li>
          ))}
        </ul>
      )
    }
  }

  return <p>{error.message}</p>
}

export function ErrorNote({ error }: { error: unknown }) {
  if (!error) return null

  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
      {error instanceof ApiError ? (
        explain(error)
      ) : (
        <p>
          Could not reach the API. If it has been quiet for a while the server may be waking up —
          give it a minute and try again.
        </p>
      )}
    </div>
  )
}
