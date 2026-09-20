import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useEvents, useMoveStatus, useShipment } from '../api/shipments'
import type { Stage } from '../api/types'
import { NEEDS_REMARKS, STAGE_LABEL } from '../lib/status'
import { etaNote, shortDate, sinceNote, whenStamp } from '../lib/format'
import { StatusBadge } from '../components/StatusBadge'
import { StageTrack } from '../components/StageTrack'
import { ErrorNote } from '../components/ErrorNote'

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{label}</dt>
      <dd className={`mt-1 text-sm text-ink-900 ${mono ? 'font-mono text-[13px]' : ''}`}>
        {value}
      </dd>
    </div>
  )
}

export function ShipmentDetail() {
  const { id = '' } = useParams()
  const shipment = useShipment(id)
  const events = useEvents(id)
  const move = useMoveStatus(id)

  const [toStatus, setToStatus] = useState<Stage | ''>('')
  const [remarks, setRemarks] = useState('')

  if (shipment.isPending) {
    return <p className="text-sm text-ink-600">Loading.</p>
  }

  if (shipment.isError) {
    return <ErrorNote error={shipment.error} />
  }

  const file = shipment.data
  const reasonRequired = toStatus !== '' && NEEDS_REMARKS.includes(toStatus)

  const history = events.data?.data ?? []
  const latest = history.length > 0 ? history[history.length - 1] : undefined

  // Where it broke out of, for the track to anchor an exception or a
  // cancellation against. Same answer the server works out from the event log,
  // read off the history this page has already fetched.
  const cameFrom = latest?.fromStatus ?? null
  const sittingFor = latest ? sinceNote(latest.occurredAt) : null
  const due =
    file.currentStatus === 'DELIVERED' || file.currentStatus === 'CANCELLED'
      ? null
      : etaNote(file.eta)
  const late = due?.includes('late') ?? false

  const fieldClass =
    'rounded-md border border-ink-300 bg-white px-3 py-1.5 text-sm text-ink-900 shadow-sm placeholder:text-ink-400 focus:border-ink-700 focus:outline-none focus:ring-1 focus:ring-ink-700'

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!toStatus) return

    move.mutate(
      {
        toStatus,
        remarks: remarks.trim() || undefined,
        // Handed back exactly as it arrived. If the file has moved since this
        // page loaded, the server refuses rather than quietly overwriting
        // whoever got there first.
        expectedVersion: file.version,
      },
      {
        onSuccess: () => {
          setToStatus('')
          setRemarks('')
        },
      },
    )
  }

  return (
    <div className="space-y-5">
      <Link to="/" className="inline-block text-sm text-ink-600 hover:text-ink-900">
        ← All files
      </Link>

      <div className="overflow-hidden rounded-lg border border-ink-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
          <div>
            <h1 className="font-mono text-lg font-semibold tracking-tight text-ink-900">
              {file.referenceNo}
            </h1>
            <p className="mt-0.5 text-sm text-ink-600">
              {file.consignee}
              <span className="mx-1.5 text-ink-300">·</span>
              <span className="font-mono text-[13px] text-ink-700">
                {file.originPort} → {file.destinationPort}
              </span>
            </p>
          </div>
          <StatusBadge stage={file.currentStatus} />
        </div>

        <div className="px-5 pb-1 pt-7">
          <StageTrack current={file.currentStatus} cameFrom={cameFrom} />
        </div>

        <p className="mt-4 border-y border-ink-100 bg-ink-50 px-5 py-2.5 text-sm text-ink-700">
          At <span className="font-medium text-ink-900">{STAGE_LABEL[file.currentStatus]}</span>
          {sittingFor ? ` for ${sittingFor}` : ''}
          <span className="mx-1.5 text-ink-300">·</span>
          {file.eta ? (
            <>
              ETA <span className="tabular-nums">{shortDate(file.eta)}</span>
              {due && (
                <span className={late ? ' font-semibold text-red-600' : ' text-ink-500'}>
                  {' '}
                  ({due})
                </span>
              )}
            </>
          ) : (
            'no ETA yet'
          )}
        </p>

        <dl className="grid grid-cols-2 gap-5 px-5 py-4 sm:grid-cols-4">
          <Field label="House B/L" value={file.houseBlNo ?? '—'} mono />
          <Field label="Master B/L" value={file.masterBlNo ?? '—'} mono />
          <Field label="Mode" value={file.mode.replace('_', ' ')} />
          <Field label="Incoterm" value={file.incoterm ?? '—'} />
        </dl>
      </div>

      <div className="rounded-lg border border-ink-200 bg-white p-5 shadow-sm">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          Move this file
        </h2>

        {file.nextStatuses.length === 0 ? (
          <p className="mt-3 text-sm text-ink-600">
            This file is closed. Nothing moves on from {STAGE_LABEL[file.currentStatus]}.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={toStatus}
                onChange={(event) => setToStatus(event.target.value as Stage | '')}
                className={fieldClass}
              >
                <option value="">Move to…</option>
                {/* Only what the server said is legal from here. The dropdown
                    never offers a move it is going to turn down. */}
                {file.nextStatuses.map((stage) => (
                  <option key={stage} value={stage}>
                    {STAGE_LABEL[stage]}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!toStatus || move.isPending || (reasonRequired && !remarks.trim())}
                className="rounded-md bg-ink-900 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-ink-800 disabled:opacity-40"
              >
                {move.isPending ? 'Saving…' : 'Record it'}
              </button>
            </div>

            <div>
              <input
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder={
                  reasonRequired ? 'Reason — required for this one' : 'Remarks (optional)'
                }
                className={`w-full ${fieldClass}`}
              />
              {reasonRequired && (
                <p className="mt-1.5 text-xs text-amber-700">
                  A hold or an exception with no reason on it is useless to whoever picks this
                  file up next.
                </p>
              )}
            </div>

            <ErrorNote error={move.error} />
          </form>
        )}
      </div>

      <div className="rounded-lg border border-ink-200 bg-white p-5 shadow-sm">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">History</h2>

        {events.isPending && <p className="mt-3 text-sm text-ink-600">Loading.</p>}
        <ErrorNote error={events.error} />

        {/* Newest first. Somebody opening this file wants to know what just
            happened, not what happened the week it was booked. */}
        <ol className="mt-4 space-y-0">
          {[...history].reverse().map((event, index) => (
            <li key={event.id} className="flex gap-4">
              <div className="w-28 shrink-0 pt-0.5 text-xs tabular-nums text-ink-500">
                {whenStamp(event.occurredAt)}
              </div>

              {/* A rail down the left so the entries read as one thread rather
                  than a stack of unrelated rows. */}
              <div className="relative flex flex-col items-center">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    index === 0 ? 'bg-ink-900' : 'bg-ink-300'
                  }`}
                />
                <span className="w-px flex-1 bg-ink-100" />
              </div>

              <div className="pb-5 text-sm">
                <div className="text-ink-900">
                  {event.fromStatus ? (
                    <>
                      <span className="text-ink-600">{STAGE_LABEL[event.fromStatus]}</span>
                      <span className="mx-1.5 text-ink-300">→</span>
                      <span className="font-medium">{STAGE_LABEL[event.toStatus]}</span>
                    </>
                  ) : (
                    <>
                      File opened at{' '}
                      <span className="font-medium">{STAGE_LABEL[event.toStatus]}</span>
                    </>
                  )}
                </div>
                {event.remarks && <div className="mt-1 text-ink-600">{event.remarks}</div>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
