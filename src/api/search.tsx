import { queryOptions, useQuery } from '@tanstack/react-query'
import { apiRequest } from './'

export interface SearchResult {
  projects: Array<{
    id: number
    name: string
    displayName?: string
    description?: string
    [key: string]: unknown
  }>
  challenges: Array<{
    id: number
    name: string
    description?: string
    [key: string]: unknown
  }>
  tasks: Array<{
    id: number
    name: string
    status: number | null
    parent: number
    challengeName: string
  }>
}

export interface SearchByIdResult {
  project: {
    id: number
    name: string
    displayName?: string
    description?: string
  } | null
  challenge: {
    id: number
    name: string
    description?: string
  } | null
  task: {
    id: number
    name: string
    status: number | null
    parent: number
    challengeName?: string
  } | null
}

export const search = {
  unifiedSearch: ({ q, limit = 25 }: { q: string; limit?: number }) =>
    useQuery(
      queryOptions({
        queryKey: ['unifiedSearch', q, limit],
        queryFn: () =>
          apiRequest
            .get('api/v2/search', {
              searchParams: { q, limit },
            })
            .json<SearchResult>(),
        enabled: q.length > 0,
        placeholderData: (previousData) => previousData,
      })
    ),

  searchById: ({ id }: { id: number }) =>
    useQuery(
      queryOptions({
        queryKey: ['searchById', id],
        queryFn: () =>
          apiRequest
            .get('api/v2/search/byId', {
              searchParams: { id },
            })
            .json<SearchByIdResult>(),
        enabled: id > 0,
        placeholderData: (previousData) => previousData,
      })
    ),
}
