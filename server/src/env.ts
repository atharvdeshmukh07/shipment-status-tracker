function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set — copy .env.example to .env`)
  return value
}

export const env = {
  // Render hands you a port. Hardcoding 4000 means the health check never passes.
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required('DATABASE_URL'),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  // Off locally, on in production so Vercel preview deployments can talk to the
  // API without a redeploy every time the hostname changes.
  allowVercelPreviews: process.env.ALLOW_VERCEL_PREVIEWS === 'true',
}
