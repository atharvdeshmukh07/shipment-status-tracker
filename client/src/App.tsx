import { Link, Route, Routes } from 'react-router-dom'
import { ThemeToggle } from './components/ThemeToggle'
import { ShipmentList } from './pages/ShipmentList'
import { ShipmentDetail } from './pages/ShipmentDetail'
import { NewShipment } from './pages/NewShipment'

// Stacked containers seen end-on. Two letters in a box said nothing about what
// this is for.
function Mark() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/10">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="13" width="8" height="6" rx="1" />
        <rect x="13" y="13" width="8" height="6" rx="1" />
        <rect x="8" y="6" width="8" height="6" rx="1" />
      </svg>
    </span>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-page">
      <header className="bg-chrome text-on-chrome">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <Link to="/" className="flex items-center gap-3">
            <Mark />
            <span className="text-[19px] font-semibold tracking-tight">
              Shipment Status Tracker
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            {/* Inverse of the header, not the page. Using the same action token
                as the page buttons made this one dark-on-dark and invisible. */}
            <Link
              to="/new"
              className="flex items-center gap-1.5 rounded-md bg-on-chrome px-3.5 py-2 text-sm font-semibold text-chrome shadow-sm transition hover:opacity-90"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
              Open a file
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7">
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
