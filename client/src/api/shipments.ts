import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { ListResponse, Shipment, ShipmentDetail, ShipmentEvent, Stage } from './types'

export type ListFilters = {
  status: Stage | ''
  q: string
  limit: number
  offset: number
}

function listPath(filters: ListFilters): string {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.q.trim()) params.set('q', filters.q.trim())
  params.set('limit', String(filters.limit))
  params.set('offset', String(filters.offset))
  return `/api/v1/shipments?${params.toString()}`
}

export function useShipments(filters: ListFilters) {
  return useQuery({
    queryKey: ['shipments', filters],
    queryFn: () => api.get<ListResponse>(listPath(filters)),
    // Keeps the rows on screen while a new search runs. A table that blinks
    // back to a spinner on every keystroke is harder to read, not more honest.
    placeholderData: (previous) => previous,
  })
}

// The list endpoint already hands back a total for whatever filter it is given,
// so the counts along the top come from a few cheap reads of that rather than a
// summary endpoint I would then have to keep in step with the filters. If the
// board ever got big enough for this to hurt, one GROUP BY would replace it.
export function useCount(status: Stage | null) {
  return useQuery({
    queryKey: ['count', status ?? 'all'],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '1', offset: '0' })
      if (status) params.set('status', status)
      return api.get<ListResponse>(`/api/v1/shipments?${params.toString()}`)
    },
    select: (response) => response.pagination.total,
  })
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: ['shipment', id],
    queryFn: () => api.get<ShipmentDetail>(`/api/v1/shipments/${id}`),
  })
}

export function useEvents(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => api.get<{ data: ShipmentEvent[] }>(`/api/v1/shipments/${id}/events`),
  })
}

export function useMoveStatus(id: string) {
  const cache = useQueryClient()

  return useMutation({
    mutationFn: (body: { toStatus: Stage; remarks?: string; expectedVersion: number }) =>
      api.post<Shipment>(`/api/v1/shipments/${id}/status`, body),
    // Deliberately not optimistic. The server owns the version number, and
    // painting a move on screen that it might still refuse is the exact lie
    // the version guard exists to prevent.
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: ['shipment', id] })
      cache.invalidateQueries({ queryKey: ['events', id] })
      cache.invalidateQueries({ queryKey: ['shipments'] })
    },
  })
}

export function useCreateShipment() {
  const cache = useQueryClient()

  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post<Shipment>('/api/v1/shipments', body),
    onSuccess: () => cache.invalidateQueries({ queryKey: ['shipments'] }),
  })
}
