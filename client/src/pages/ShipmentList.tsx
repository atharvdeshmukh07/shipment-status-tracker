import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCount, useShipments, type ListFilters } from '../api/shipments'
import type { Stage } from '../api/types'
import { STAGE_EDGE, STAGE_LABEL } from '../lib/status'
import { etaNote, shortDate } from '../lib/format'
import { StatusBadge } from '../components/StatusBadge'
import { ErrorNote } from '../components/ErrorNote'

const PAGE = 15

const ALL_STAGES = Object.keys(STAGE_LABEL) as Stage[]

const FIELD =
  'rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-body shadow-sm placeholder:text-faint focus:border-muted focus:outline-none focus:ring-1 focus:ring-muted'

// The number stays in body ink and the label is always written out. The dot
// carries the status, so nothing here rests on telling amber from red — those
// two are low contrast against a pale surface, and the written label is what
// makes that acceptable rather than a guess.
function Tally({
  label,
  count,
  dot,
  active,
  onPick,
}: {
  label: string
  count: number | undefined
  dot?: string
  active: boolean
  onPick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={`flex-1 rounded-lg border bg-surface px-4 py-3 text-left shadow-sm transition ${
        active ? 'border-body ring-1 ring-body' : 'border-line hover:border-muted'
      }`}
    >
      <span className="flex items-center gap-1.5">
        {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
      </span>
      <span className="mt-1.5 block text-[28px] font-semibold leading-none tabular-nums text-body">
        {count ?? '·'}
      </span>
    </button>
  )
}

export function ShipmentList() {
  const [filters, setFilters] = useState<ListFilters>({
    status: '',
    q: '',
    limit: PAGE,
    offset: 0,
  })

  const { data, error, isPending } = useShipments(filters)

  const onBook = useCount(null)
  const moving = useCount('IN_TRANSIT')
  const held = useCount('CUSTOMS_HOLD')
  const broken = useCount('EXCEPTION')

  // Any change to what is being looked for sends you back to page one. Staying
  // on page three of a search you just replaced shows an empty table, which
  // reads as "nothing matched" when it isn't.
  function narrow(change: Partial<ListFilters>) {
    setFilters((current) => ({ ...current, ...change, offset: 0 }))
  }

  function pick(status: Stage | '') {
    narrow({ status: filters.status === status ? '' : status })
  }

  const total = data?.pagination.total ?? 0
  const firstOnPage = total === 0 ? 0 : filters.offset + 1
  const lastOnPage = Math.min(filters.offset + PAGE, total)

  // Two permanently greyed-out buttons read as broken, not as "there is only
  // one page". So when everything fits, the controls are not there at all.
  const paged = total > PAGE

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <Tally
          label="On the book"
          count={onBook.data}
          active={filters.status === ''}
          onPick={() => pick('')}
        />
        <Tally
          label="In transit"
          count={moving.data}
          dot="bg-sky-500"
          active={filters.status === 'IN_TRANSIT'}
          onPick={() => pick('IN_TRANSIT')}
        />
        <Tally
          label="Customs hold"
          count={held.data}
          dot="bg-amber-500"
          active={filters.status === 'CUSTOMS_HOLD'}
          onPick={() => pick('CUSTOMS_HOLD')}
        />
        <Tally
          label="Exception"
          count={broken.data}
          dot="bg-red-500"
          active={filters.status === 'EXCEPTION'}
          onPick={() => pick('EXCEPTION')}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={filters.q}
          onChange={(event) => narrow({ q: event.target.value })}
          placeholder="Reference or house B/L"
          className={`w-72 ${FIELD}`}
        />

        <select
          value={filters.status}
          onChange={(event) => narrow({ status: event.target.value as Stage | '' })}
          className={FIELD}
        >
          <option value="">Any status</option>
          {ALL_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {STAGE_LABEL[stage]}
            </option>
          ))}
        </select>

        <span className="text-sm text-muted">
          {total === 0
            ? 'No files'
            : paged
              ? `${firstOnPage}–${lastOnPage} of ${total}`
              : `${total} ${total === 1 ? 'file' : 'files'}`}
        </span>
      </div>

      <ErrorNote error={error} />

      {isPending ? (
        <p className="text-sm text-muted">
          Loading. If the API has been idle this can take a minute to wake up.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-raised text-[11px] font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2.5 pl-4 pr-3">Reference</th>
                <th className="px-3 py-2.5">Lane</th>
                <th className="px-3 py-2.5">Consignee</th>
                <th className="px-3 py-2.5">ETA</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    Nothing matches that.
                  </td>
                </tr>
              )}

              {data?.data.map((shipment) => {
                // A file that has arrived or been dropped cannot be late, so it
                // does not get a countdown shouting at whoever is scanning down
                // the column.
                const settled =
                  shipment.currentStatus === 'DELIVERED' ||
                  shipment.currentStatus === 'CANCELLED'
                const due = settled ? null : etaNote(shipment.eta)

                return (
                  <tr
                    key={shipment.id}
                    className={`border-b border-l-2 border-b-hair last:border-b-0 hover:bg-raised ${
                      STAGE_EDGE[shipment.currentStatus] ?? 'border-l-transparent'
                    }`}
                  >
                    <td className="py-2.5 pl-4 pr-3">
                      <Link
                        to={`/shipments/${shipment.id}`}
                        className="font-mono text-[13px] font-medium text-body hover:underline"
                      >
                        {shipment.referenceNo}
                      </Link>
                      <div className="font-mono text-[11px] text-faint">
                        {shipment.houseBlNo ?? '—'}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-body">
                      <span className="font-mono text-[13px]">
                        {shipment.originPort} → {shipment.destinationPort}
                      </span>
                      <div className="text-[11px] uppercase tracking-wider text-faint">
                        {shipment.mode.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-body">{shipment.consignee}</td>
                    <td className="px-3 py-2.5 text-body">
                      <span className="tabular-nums">{shortDate(shipment.eta)}</span>
                      {due && (
                        <div
                          className={`text-[11px] ${
                            due.includes('late')
                              ? 'font-medium text-red-600 dark:text-red-400'
                              : 'text-faint'
                          }`}
                        >
                          {due}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge stage={shipment.currentStatus} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {paged && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setFilters((current) => ({
                ...current,
                offset: Math.max(0, current.offset - PAGE),
              }))
            }
            disabled={filters.offset === 0}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-body shadow-sm transition hover:border-muted disabled:opacity-40 disabled:hover:border-line"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setFilters((current) => ({ ...current, offset: current.offset + PAGE }))}
            disabled={lastOnPage >= total}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-body shadow-sm transition hover:border-muted disabled:opacity-40 disabled:hover:border-line"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
