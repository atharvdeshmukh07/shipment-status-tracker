export type Theme = 'light' | 'dark'

const KEY = 'stt-theme'

export function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Safari in a private window throws on touching storage rather than
    // handing back null, so this has to be caught and not checked for.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // Not being able to remember the choice is no reason to refuse to apply it.
  }
}
