import { useState } from 'react'
import { applyTheme, readTheme, type Theme } from '../lib/theme'

export function ThemeToggle() {
  // Seeded from whatever the inline script in index.html already decided, so
  // the button never disagrees with the page it is sitting on.
  const [theme, setTheme] = useState<Theme>(() => readTheme())

  function flip() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-on-chrome/70 transition hover:bg-white/10 hover:text-on-chrome"
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
        </svg>
      )}
    </button>
  )
}
