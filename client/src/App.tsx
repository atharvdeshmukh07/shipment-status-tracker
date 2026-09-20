import { Link, Route, Routes } from 'react-router-dom'
import { ThemeToggle } from './components/ThemeToggle'
import { ShipmentList } from './pages/ShipmentList'
import { ShipmentDetail } from './pages/ShipmentDetail'
import { NewShipment } from './pages/NewShipment'

export default function App() {
  return (
    <div className="min-h-screen bg-page">
      <header className="bg-chrome text-on-chrome">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-white/10 font-mono text-[13px] font-medium">
              ST
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight tracking-tight">
                Shipment Status Tracker
              </span>
              <span className="block text-[11px] leading-tight text-on-chrome/55">
                Import operations · Nhava Sheva &amp; Mundra desk
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Link
              to="/new"
              className="rounded-md bg-action px-3 py-1.5 text-sm font-medium text-on-action transition hover:bg-action-2"
            >
              Open a file
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<ShipmentList />} />
          <Route path="/shipments/:id" element={<ShipmentDetail />} />
          <Route path="/new" element={<NewShipment />} />
          <Route path="*" element={<p className="text-sm text-muted">Nothing here.</p>} />
        </Routes>
      </main>
    </div>
  )
}
