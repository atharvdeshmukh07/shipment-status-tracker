import { z } from 'zod'
import { NEEDS_REMARKS, STAGES } from '../domain/status.js'

const stage = z.enum(STAGES)
const port = z.string().trim().toUpperCase().min(3).max(8)

export const newShipment = z.object({
  referenceNo: z.string().trim().min(3).max(64),
  houseBlNo: z.string().trim().max(64).optional(),
  masterBlNo: z.string().trim().max(64).optional(),
  mode: z.enum(['SEA_FCL', 'SEA_LCL', 'AIR']),
  originPort: port,
  destinationPort: port,
  consignee: z.string().trim().min(2).max(160),
  incoterm: z.string().trim().toUpperCase().max(8).optional(),
  // Date only. Anything with a time in it gets rejected rather than quietly
  // truncated, because a truncated timestamp is how the day slips by one.
  eta: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD')
    .optional(),
  // A file already in motion can be entered where it actually is. Its history
  // then starts from that point, which is the honest thing to record.
  status: stage.optional(),
  remarks: z.string().trim().max(500).optional(),
})

export type NewShipment = z.infer<typeof newShipment>

export const listQuery = z.object({
  status: stage.optional(),
  q: z.string().trim().optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(['created_at', 'eta', 'reference_no']).default('created_at'),
  dir: z.enum(['asc', 'desc']).default('desc'),
})

export type ListQuery = z.infer<typeof listQuery>

export const statusChange = z
  .object({
    toStatus: stage,
    remarks: z.string().trim().max(500).optional(),
    expectedVersion: z.coerce.number().int().positive(),
  })
  .superRefine((body, ctx) => {
    if (NEEDS_REMARKS.includes(body.toStatus) && !body.remarks) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['remarks'],
        message: `${body.toStatus} needs a reason, the desk has to know why`,
      })
    }
  })

export type StatusChange = z.infer<typeof statusChange>

export const idParam = z.object({ id: z.string().uuid('not a shipment id') })
