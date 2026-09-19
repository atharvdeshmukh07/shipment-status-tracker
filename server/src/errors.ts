export type ErrorCode =
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'DUPLICATE_REFERENCE'
  | 'ILLEGAL_TRANSITION'
  | 'VERSION_CONFLICT'
  | 'INTERNAL'

const statusFor: Record<ErrorCode, number> = {
  VALIDATION_FAILED: 422,
  NOT_FOUND: 404,
  DUPLICATE_REFERENCE: 409,
  ILLEGAL_TRANSITION: 409,
  VERSION_CONFLICT: 409,
  INTERNAL: 500,
}

// Three of these are 409s on purpose. "someone else moved this" is fixed by
// refetching, "you can't go there from here" never is, and the client needs to
// tell them apart to know whether retrying is worth anything.
export class ApiError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details?: unknown

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = statusFor[code]
    this.details = details
  }
}
