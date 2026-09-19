import { PrismaClient } from '@prisma/client'
import type { Stage } from '../src/domain/status.js'
import { referenceKey } from '../src/domain/reference.js'

const prisma = new PrismaClient()

type Leg = {
  to: Stage
  daysAgo: number
  note?: string
}

type Job = {
  ref: string
  hbl: string
  mbl: string
  mode: 'SEA_FCL' | 'SEA_LCL' | 'AIR'
  from: string
  to: string
  consignee: string
  incoterm: string
  etaInDays: number
  chain: Leg[]
}

// Twelve files off a Mumbai import desk. Nine sea, three air, spread across the
// stages so the list page has something to filter and the timeline has
// something to show. Dates are all relative to today, otherwise the whole book
// looks abandoned a month from now.
const jobs: Job[] = [
  {
    ref: 'NGK/IMP/2026/0431',
    hbl: 'NGKH2604310',
    mbl: 'MAEU771420385',
    mode: 'SEA_FCL',
    from: 'AEJEA',
    to: 'INNSA',
    consignee: 'Harsha Polymers Pvt Ltd',
    incoterm: 'CIF',
    etaInDays: 4,
    chain: [
      { to: 'BOOKED', daysAgo: 27 },
      { to: 'DOCS_RECEIVED', daysAgo: 25, note: 'inv, pl and obl in' },
      { to: 'IN_TRANSIT', daysAgo: 22, note: 'sailed jebel ali' },
      { to: 'ARRIVED_AT_PORT', daysAgo: 5 },
      { to: 'CUSTOMS_FILED', daysAgo: 4, note: 'be 4521 filed' },
      { to: 'CUSTOMS_HOLD', daysAgo: 2, note: 'exam ordered by shed, value query on hs 3920' },
    ],
  },
  {
    ref: 'NGK/IMP/2026/0436',
    hbl: 'NGKH2604361',
    mbl: 'MSCU884411902',
    mode: 'SEA_LCL',
    from: 'CNSHA',
    to: 'INNSA',
    consignee: 'Vedant Auto Components',
    incoterm: 'FOB',
    etaInDays: 9,
    chain: [
      { to: 'BOOKED', daysAgo: 16 },
      { to: 'DOCS_RECEIVED', daysAgo: 13 },
      { to: 'IN_TRANSIT', daysAgo: 11, note: 'consol via colombo' },
    ],
  },
  {
    ref: 'NGK/IMP/2026/0442',
    hbl: 'NGKH2604422',
    mbl: 'HLCU6620118',
    mode: 'SEA_FCL',
    from: 'SGSIN',
    to: 'INMUN',
    consignee: 'Sundar Ceramics Pvt Ltd',
    incoterm: 'CIF',
    etaInDays: -6,
    chain: [
      { to: 'BOOKED', daysAgo: 41 },
      { to: 'DOCS_RECEIVED', daysAgo: 39 },
      { to: 'IN_TRANSIT', daysAgo: 36 },
      { to: 'ARRIVED_AT_PORT', daysAgo: 19 },
      { to: 'CUSTOMS_FILED', daysAgo: 18 },
      { to: 'CLEARED', daysAgo: 15, note: 'ooc same day' },
      { to: 'OUT_FOR_DELIVERY', daysAgo: 14 },
      { to: 'DELIVERED', daysAgo: 13, note: 'pod signed, 2 pallets short-landed, noted' },
    ],
  },
  {
    ref: 'NGK/IMP/2026/0447',
    hbl: 'NGKH2604473',
    mbl: '157-45632190',
    mode: 'AIR',
    from: 'DXB',
    to: 'BOM',
    consignee: 'Mehta Instruments',
    incoterm: 'DAP',
    etaInDays: 1,
    chain: [
      { to: 'BOOKED', daysAgo: 9 },
      { to: 'DOCS_RECEIVED', daysAgo: 8 },
      { to: 'IN_TRANSIT', daysAgo: 6, note: 'ek flight, awb released' },
      { to: 'ARRIVED_AT_PORT', daysAgo: 3, note: 'landed bom, into import shed' },
      { to: 'CUSTOMS_FILED', daysAgo: 2 },
      { to: 'CLEARED', daysAgo: 1 },
    ],
  },
  {
    ref: 'NGK/IMP/2026/0451',
    hbl: 'NGKH2604514',
    mbl: 'MAEU771550021',
    mode: 'SEA_FCL',
    from: 'KRPUS',
    to: 'INNSA',
    consignee: 'Anjali Steel Traders',
    incoterm: 'FOB',
    etaInDays: 28,
    chain: [{ to: 'BOOKED', daysAgo: 3, note: 'rate confirmed, awaiting docs' }],
  },
  {
    ref: 'NGK/IMP/2026/0458',
    hbl: 'NGKH2604585',
    mbl: 'MSCU884590117',
    mode: 'SEA_LCL',
    from: 'DEHAM',
    to: 'INNSA',
    consignee: 'Nandini Industrial Supplies',
    incoterm: 'CIF',
    etaInDays: 17,
    chain: [
      { to: 'BOOKED', daysAgo: 12 },
      { to: 'DOCS_RECEIVED', daysAgo: 10 },
      { to: 'IN_TRANSIT', daysAgo: 8 },
    ],
  },
  {
    ref: 'NGK/IMP/2026/0463',
    hbl: 'NGKH2604636',
    mbl: 'HLCU6640877',
    mode: 'SEA_FCL',
    from: 'CNSHA',
    to: 'INNSA',
    consignee: 'Aarav Textiles Pvt Ltd',
    incoterm: 'FOB',
    etaInDays: -11,
    chain: [
      { to: 'BOOKED', daysAgo: 48 },
      { to: 'DOCS_RECEIVED', daysAgo: 46 },
      { to: 'IN_TRANSIT', daysAgo: 43 },
      { to: 'ARRIVED_AT_PORT', daysAgo: 24 },
      { to: 'CUSTOMS_FILED', daysAgo: 23 },
      { to: 'CUSTOMS_HOLD', daysAgo: 22, note: 'rms flagged, exam' },
      { to: 'CUSTOMS_FILED', daysAgo: 20, note: 'exam done, refiled with revised value' },
      { to: 'CLEARED', daysAgo: 19 },
      { to: 'OUT_FOR_DELIVERY', daysAgo: 18 },
      { to: 'DELIVERED', daysAgo: 18 },
    ],
  },
  {
    ref: 'NGK/IMP/2026/0470',
    hbl: 'NGKH2604707',
    mbl: 'MAEU771661240',
    mode: 'SEA_FCL',
    from: 'AEJEA',
    to: 'INNSA',
    consignee: 'Deccan Chem Traders',
    incoterm: 'CIF',
    etaInDays: 6,
    chain: [
      { to: 'BOOKED', daysAgo: 21 },
      { to: 'DOCS_RECEIVED', daysAgo: 19 },
      { to: 'IN_TRANSIT', daysAgo: 17 },
      { to: 'EXCEPTION', daysAgo: 6, note: 'container rolled at khor fakkan, new vessel tbc' },
    ],
  },
  {
    ref: 'NGK/IMP/2026/0474',
    hbl: 'NGKH2604748',
    mbl: '098-77410326',
    mode: 'AIR',
    from: 'FRA',
    to: 'BOM',
    consignee: 'Kalyani Packaging Co',
    incoterm: 'DAP',
    etaInDays: 2,
    chain: [
      { to: 'BOOKED', daysAgo: 7 },
      { to: 'DOCS_RECEIVED', daysAgo: 6 },
      { to: 'IN_TRANSIT', daysAgo: 5 },
      { to: 'ARRIVED_AT_PORT', daysAgo: 3 },
      { to: 'CUSTOMS_FILED', daysAgo: 2 },
      { to: 'CLEARED', daysAgo: 1, note: 'duty paid, ooc out' },
    ],
  },
  {
    ref: 'NGK/IMP/2026/0479',
    hbl: 'NGKH2604799',
    mbl: 'MSCU884770634',
    mode: 'SEA_LCL',
    from: 'SGSIN',
    to: 'INNSA',
    consignee: 'Surya Electricals Pvt Ltd',
    incoterm: 'FOB',
    etaInDays: 12,
    chain: [
      { to: 'BOOKED', daysAgo: 14 },
      { to: 'DOCS_RECEIVED', daysAgo: 12 },
      { to: 'IN_TRANSIT', daysAgo: 9 },
    ],
  },
  {
    ref: 'NGK/IMP/2026/0483',
    hbl: 'NGKH2604830',
    mbl: 'HLCU6661903',
    mode: 'SEA_FCL',
    from: 'DEHAM',
    to: 'INMUN',
    consignee: 'Bhavsar Hardware',
    incoterm: 'CIF',
    etaInDays: 33,
    chain: [{ to: 'BOOKED', daysAgo: 1 }],
  },
  {
    ref: 'NGK/IMP/2026/0488',
    hbl: 'NGKH2604881',
    mbl: '157-45880471',
    mode: 'AIR',
    from: 'DXB',
    to: 'BOM',
    consignee: 'Indus Pharma Supplies',
    incoterm: 'DAP',
    etaInDays: -3,
    chain: [
      { to: 'BOOKED', daysAgo: 13 },
      { to: 'DOCS_RECEIVED', daysAgo: 12 },
      { to: 'IN_TRANSIT', daysAgo: 11 },
      { to: 'ARRIVED_AT_PORT', daysAgo: 9 },
      { to: 'CUSTOMS_FILED', daysAgo: 8, note: 'nod required, drug controller' },
      { to: 'CLEARED', daysAgo: 4 },
      { to: 'OUT_FOR_DELIVERY', daysAgo: 3 },
      { to: 'DELIVERED', daysAgo: 3, note: 'cold chain intact' },
    ],
  },
]

const DAY = 24 * 60 * 60 * 1000

function ago(days: number): Date {
  return new Date(Date.now() - days * DAY)
}

// ETA is a date column, so it wants midnight UTC and nothing else. Passing a
// local-midnight Date here is how the day ends up shifting by one.
function etaFrom(days: number): Date {
  const when = new Date(Date.now() + days * DAY)
  return new Date(Date.UTC(when.getUTCFullYear(), when.getUTCMonth(), when.getUTCDate()))
}

async function main() {
  for (const job of jobs) {
    const key = referenceKey(job.ref)
    const settled = job.chain[job.chain.length - 1]
    if (!settled) throw new Error(`${job.ref} has no events`)

    const shipment = await prisma.shipment.upsert({
      where: { referenceKey: key },
      update: {
        currentStatus: settled.to,
        eta: etaFrom(job.etaInDays),
      },
      create: {
        referenceNo: job.ref,
        referenceKey: key,
        houseBlNo: job.hbl,
        masterBlNo: job.mbl,
        mode: job.mode,
        originPort: job.from,
        destinationPort: job.to,
        consignee: job.consignee,
        incoterm: job.incoterm,
        currentStatus: settled.to,
        eta: etaFrom(job.etaInDays),
      },
    })

    // The API never deletes events. The seed does, so running it twice does not
    // stack a second copy of every chain on top of the first.
    await prisma.shipmentEvent.deleteMany({ where: { shipmentId: shipment.id } })

    let previous: Stage | null = null
    for (const leg of job.chain) {
      await prisma.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          fromStatus: previous,
          toStatus: leg.to,
          remarks: leg.note ?? null,
          occurredAt: ago(leg.daysAgo),
        },
      })
      previous = leg.to
    }
  }

  const count = await prisma.shipment.count()
  console.log(`seeded, ${count} shipments on the book`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
