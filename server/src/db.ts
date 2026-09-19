import { PrismaClient } from '@prisma/client'

// One client for the whole process. A new one per request runs Neon's free tier
// out of connections almost immediately.
export const prisma = new PrismaClient()
