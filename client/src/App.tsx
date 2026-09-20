import { Link, Route, Routes } from 'react-router-dom'
import { ShipmentList } from './pages/ShipmentList'
import { ShipmentDetail } from './pages/ShipmentDetail'
import { NewShipment } from './pages/NewShipment'

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-ink-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-white/10 font-mono text-[13px] font-medium">
              ST
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight tracking-tight">
                Shipment Status Tracker
              </span>
              <span className="block text-[11px] leading-tight text-ink-400">
                Import operations · Nhava Sheva &amp; Mundra desk
              </span>
            </span>
          </Link>

          <Link
            to="/new"
            className="shrink-0 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-ink-900 transition hover:bg-ink-100"
          >
            Open a file
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<ShipmentList />} />
          <Route path="/shipments/:id" element={<ShipmentDetail />} />
          <Route path="/new" element={<NewShipment />} />
          <Route path="*" element={<p className="text-sm text-ink-600">Nothing here.</p>} />
        </Routes>
      </main>
    </div>
  )
}
