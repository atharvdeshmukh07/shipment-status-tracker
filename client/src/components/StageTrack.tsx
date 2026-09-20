import type { Stage } from '../api/types'
import { TRACK_LABEL, TRACK_LINE } from '../lib/status'

// Hold, exception and cancelled are not steps on this line, so the track keeps
// showing the run the file was making and the state it is actually stuck in
// gets said in words underneath. Drawing them as a ninth and tenth step would
// suggest every shipment passes through customs hold on its way to delivery.
export function StageTrack({ current, cameFrom }: { current: Stage; cameFrom: Stage | null }) {
  const anchor: Stage =
    current === 'CUSTOMS_HOLD'
      ? 'CUSTOMS_FILED'
      : current === 'EXCEPTION' || current === 'CANCELLED'
        ? (cameFrom ?? 'BOOKED')
        : current

  const at = Math.max(0, TRACK_LINE.indexOf(anchor))
  const last = TRACK_LINE.length - 1

  const hereTone =
    current === 'EXCEPTION'
      ? 'bg-red-500 ring-red-500/20'
      : current === 'CANCELLED'
        ? 'bg-ink-400 ring-ink-400/20'
        : current === 'CUSTOMS_HOLD'
          ? 'bg-amber-500 ring-amber-500/25'
          : 'bg-ink-900 ring-ink-900/15'

  const aside =
    current === 'CUSTOMS_HOLD'
      ? 'Held at customs. It does not move on until the query is answered.'
      : current === 'EXCEPTION'
        ? 'Off the rails. It goes back to where it broke from once that is sorted.'
        : current === 'CANCELLED'
          ? 'Cancelled. Nothing further happens on this file.'
          : null

  const asideTone =
    current === 'EXCEPTION'
      ? 'border-red-200 bg-red-50 text-red-800'
      : current === 'CUSTOMS_HOLD'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-ink-200 bg-ink-50 text-ink-700'

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <ol className="flex min-w-max">
          {TRACK_LINE.map((stage, index) => {
            const done = index < at
            const here = index === at
            return (
              <li key={stage} className="flex min-w-[84px] flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  <span
                    className={`h-0.5 flex-1 rounded-full ${
                      index === 0 ? 'bg-transparent' : done || here ? 'bg-ink-900' : 'bg-ink-200'
                    }`}
                  />
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      here ? `${hereTone} ring-4` : done ? 'bg-ink-900' : 'bg-ink-200'
                    }`}
                  />
                  <span
                    className={`h-0.5 flex-1 rounded-full ${
                      index === last ? 'bg-transparent' : done ? 'bg-ink-900' : 'bg-ink-200'
                    }`}
                  />
                </div>
                <span
                  className={`mt-2.5 px-1 text-center text-[11px] leading-tight ${
                    here
                      ? 'font-semibold text-ink-900'
                      : done
                        ? 'text-ink-700'
                        : 'text-ink-400'
                  }`}
                >
                  {TRACK_LABEL[stage]}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      {aside && (
        <p className={`mt-4 rounded-md border px-3 py-2 text-sm ${asideTone}`}>{aside}</p>
      )}
    </div>
  )
}
