import type { Stage } from '../api/types'
import { STAGE_LABEL, STAGE_TONE } from '../lib/status'

export function StatusBadge({ stage }: { stage: Stage }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${STAGE_TONE[stage]}`}
    >
      {STAGE_LABEL[stage]}
    </span>
  )
}
