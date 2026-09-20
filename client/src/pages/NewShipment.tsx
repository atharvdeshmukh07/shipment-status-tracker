import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateShipment } from '../api/shipments'
import type { Mode } from '../api/types'
import { referenceKey } from '../lib/reference'
import { ErrorNote } from '../components/ErrorNote'

type Draft = {
  referenceNo: string
  houseBlNo: string
  masterBlNo: string
  mode: Mode
  originPort: string
  destinationPort: string
  consignee: string
  incoterm: string
  eta: string
}

const EMPTY: Draft = {
  referenceNo: '',
  houseBlNo: '',
  masterBlNo: '',
  mode: 'SEA_FCL',
  originPort: '',
  destinationPort: '',
  consignee: '',
  incoterm: '',
  eta: '',
}

const inputClass =
  'mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-body shadow-sm placeholder:text-faint focus:border-muted focus:outline-none focus:ring-1 focus:ring-muted'

// Three groups, because that is the order the desk actually gets the
// information in: whose job it is, where the box is going, and the paperwork
// that turns up days later. A flat grid of nine boxes is the same fields in no
// order at all.
function Section({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="border-t border-hair px-5 py-5 first:border-t-0">
      <div className="mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-body">{title}</h2>
        <p className="mt-0.5 text-xs text-muted">{note}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Row({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="flex items-baseline gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
        {required && <span className="text-[10px] uppercase text-faint">required</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export function NewShipment() {
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const create = useCreateShipment()
  const goTo = useNavigate()

  function set<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const matchKey = referenceKey(draft.referenceNo)

  function submit(event: FormEvent) {
    event.preventDefault()

    // Optional fields left blank are dropped rather than sent as "". The schema
    // on the other side treats an empty string as a value and turns it down.
    const body: Record<string, unknown> = {
      referenceNo: draft.referenceNo,
      mode: draft.mode,
      originPort: draft.originPort,
      destinationPort: draft.destinationPort,
      consignee: draft.consignee,
    }
    if (draft.houseBlNo.trim()) body.houseBlNo = draft.houseBlNo.trim()
    if (draft.masterBlNo.trim()) body.masterBlNo = draft.masterBlNo.trim()
    if (draft.incoterm.trim()) body.incoterm = draft.incoterm.trim()
    if (draft.eta) body.eta = draft.eta

    create.mutate(body, { onSuccess: (shipment) => goTo(`/shipments/${shipment.id}`) })
  }

  return (
    <form onSubmit={submit} className="max-w-3xl">
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="border-b border-line bg-chrome px-5 py-4 text-on-chrome">
          <h1 className="text-[20px] font-semibold tracking-tight">Open a file</h1>
          <p className="mt-0.5 text-sm text-on-chrome/60">
            It starts at Booked, and that counts as the first entry in its history.
          </p>
        </div>

        <Section title="The file" note="What this job is called and who it belongs to">
          <Row
            label="Reference"
            required
            hint={
              matchKey
                ? `Searchable as ${matchKey} — punctuation and case are stripped`
                : 'Slashes, dashes and case do not matter when searching later'
            }
          >
            <input
              required
              value={draft.referenceNo}
              onChange={(event) => set('referenceNo', event.target.value)}
              placeholder="NGK/IMP/2026/0501"
              className={`${inputClass} font-mono`}
            />
          </Row>

          <Row label="Consignee" required>
            <input
              required
              value={draft.consignee}
              onChange={(event) => set('consignee', event.target.value)}
              placeholder="Surya Electricals Pvt Ltd"
              className={inputClass}
            />
          </Row>
        </Section>

        <Section title="The shipment" note="Lane, mode and when it is due">
          <Row label="Mode" required>
            <select
              value={draft.mode}
              onChange={(event) => set('mode', event.target.value as Mode)}
              className={inputClass}
            >
              <option value="SEA_FCL">Sea FCL</option>
              <option value="SEA_LCL">Sea LCL</option>
              <option value="AIR">Air</option>
            </select>
          </Row>

          <Row label="ETA" hint="Leave blank until the carrier confirms one">
            <input
              type="date"
              value={draft.eta}
              onChange={(event) => set('eta', event.target.value)}
              className={inputClass}
            />
          </Row>

          <Row label="Origin port" required hint="UN/LOCODE — AEJEA, CNSHA, DXB">
            <input
              required
              value={draft.originPort}
              onChange={(event) => set('originPort', event.target.value.toUpperCase())}
              placeholder="AEJEA"
              className={`${inputClass} font-mono`}
            />
          </Row>

          <Row label="Destination port" required hint="INNSA, INMUN, BOM">
            <input
              required
              value={draft.destinationPort}
              onChange={(event) => set('destinationPort', event.target.value.toUpperCase())}
              placeholder="INNSA"
              className={`${inputClass} font-mono`}
            />
          </Row>
        </Section>

        <Section
          title="Paperwork"
          note="Whatever has come through so far — none of it is needed to open the file"
        >
          <Row label="House B/L">
            <input
              value={draft.houseBlNo}
              onChange={(event) => set('houseBlNo', event.target.value)}
              placeholder="NGKH2605011"
              className={`${inputClass} font-mono`}
            />
          </Row>

          <Row label="Master B/L">
            <input
              value={draft.masterBlNo}
              onChange={(event) => set('masterBlNo', event.target.value)}
              placeholder="MAEU771990412"
              className={`${inputClass} font-mono`}
            />
          </Row>

          <Row label="Incoterm">
            <input
              value={draft.incoterm}
              onChange={(event) => set('incoterm', event.target.value.toUpperCase())}
              placeholder="CIF"
              className={`${inputClass} font-mono`}
            />
          </Row>
        </Section>

        <div className="border-t border-line bg-raised px-5 py-4">
          <ErrorNote error={create.error} />

          <div className="mt-3 flex items-center justify-end gap-4 first:mt-0">
            <Link to="/" className="text-sm text-muted hover:text-body">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={create.isPending}
              className="rounded-md bg-action px-4 py-2 text-sm font-medium text-on-action shadow-sm transition hover:bg-action-2 disabled:opacity-40"
            >
              {create.isPending ? 'Opening…' : 'Open the file'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
