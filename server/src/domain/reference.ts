// Operators type the same file a dozen different ways: NGK/IMP/2026/0431,
// ngk-imp-2026-0431, sometimes with a stray space. Strip it down to letters and
// digits and match on that, so the unique constraint actually catches duplicates.
export function referenceKey(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

// % and _ are wildcards in LIKE, so searching for NGK_IMP would quietly match
// more than the operator meant. Escape them and use ESCAPE '\' in the query.
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`)
}
