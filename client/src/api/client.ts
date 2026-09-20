const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

type ErrorBody = {
  error: { code: string; message: string; details?: unknown }
}

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: unknown

  constructor(status: number, body: ErrorBody) {
    super(body.error.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.error.code
    this.details = body.error.details
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!res.ok) {
    // The API always sends back the same error envelope, but a sleeping host or
    // a proxy in between can hand over HTML instead, so don't assume JSON.
    let body: ErrorBody | null = null
    try {
      body = (await res.json()) as ErrorBody
    } catch {
      body = null
    }

    throw new ApiError(
      res.status,
      body ?? { error: { code: 'UNREADABLE', message: `server answered ${res.status}` } },
    )
  }

  return (await res.json()) as T
}

export const api = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
}
