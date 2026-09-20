// Mirrors the normaliser on the server so the operator can see, while typing,
// what the reference will actually be matched on later. The server is still the
// authority — this is a hint, not a validation, and it is three lines rather
// than a round trip on every keystroke.
export function referenceKey(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
}
