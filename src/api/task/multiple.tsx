import {
  keepPreviousData,
  queryOptions,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  TaskGetResponse,
  TaskMarkersParams,
  TaskMarkersResponse,
  TasksInBoundsParams,
  TasksInBoundsResponse,
  TaskTilesParams,
  TaskTilesResponse,
} from '@/types/Task'
import { getTilesForBounds } from '@/utils/mapUtils'
import { apiRequest, convertParamsToSearchParams } from '../'

const TILE_CACHE_ZOOM = 14

export const taskMultiple = {
  getTasks: (taskIds: number[]) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['tasks', taskIds.sort((a, b) => a - b)],
        queryFn: async () => {
          const cachedTasks: TaskGetResponse[] = []
          const missingIds: number[] = []

          for (const id of taskIds) {
            const cached = queryClient.getQueryData<TaskGetResponse>(['task', id])
            if (cached) {
              cachedTasks.push(cached)
            } else {
              missingIds.push(id)
            }
          }

          if (missingIds.length === 0) {
            return cachedTasks
          }

          const fetched = await apiRequest
            .get('api/v2/tasks', {
              searchParams: {
                taskIds: missingIds.join(','),
                mapillary: 'false',
              },
            })
            .json<TaskGetResponse[]>()

          for (const task of fetched) {
            queryClient.setQueryData(['task', task.id], task)
          }

          return [...cachedTasks, ...fetched]
        },
        enabled: taskIds.length > 0,
      })
    )
  },

  getTaskMarkers: (params: TaskMarkersParams) =>
    useQuery(
      queryOptions({
        queryKey: ['taskMarkers', params],
        queryFn: ({ signal }) =>
          apiRequest
            .get(`api/v2/taskMarkers`, {
              searchParams: convertParamsToSearchParams(params),
              signal,
            })
            .json<TaskMarkersResponse>(),
        placeholderData: keepPreviousData,
      })
    ),

  getTasksInBounds: (params: TasksInBoundsParams) =>
    useQuery(
      queryOptions({
        queryKey: ['tasksInBounds', params],
        queryFn: ({ signal }) =>
          apiRequest
            .get('api/v2/tasks/bounds', {
              searchParams: convertParamsToSearchParams({ ...params }),
              signal,
            })
            .json<TasksInBoundsResponse>(),
        placeholderData: keepPreviousData,
      })
    ),

  getTaskTiles: (params: TaskTilesParams) => {
    const { z, bounds, ...filterParams } = params
    const isEnabled = bounds !== undefined && bounds !== ''
    const usePerTileCache = z >= TILE_CACHE_ZOOM
    const tiles = usePerTileCache && isEnabled ? getTilesForBounds(bounds, TILE_CACHE_ZOOM) : []

    // Zoom < 14: single query with viewport bounds
    const singleResult = useQuery(
      queryOptions({
        queryKey: ['taskTiles', params],
        queryFn: ({ signal }) =>
          apiRequest
            .get(`api/v2/taskTiles/${z}`, {
              searchParams: convertParamsToSearchParams({ bounds, ...filterParams }),
              signal,
            })
            .json<TaskTilesResponse>(),
        placeholderData: keepPreviousData,
        enabled: !usePerTileCache && isEnabled,
      })
    )

    // Zoom >= 14: each tile is its own independent cached query
    const tilesResult = useQueries({
      queries: tiles.map((tile) => ({
        queryKey: ['taskTile', tile.x, tile.y, tile.z, filterParams],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          apiRequest
            .get(`api/v2/taskTile/${tile.z}/${tile.x}/${tile.y}`, {
              searchParams: convertParamsToSearchParams(filterParams),
              signal,
            })
            .json<TaskTilesResponse>(),
        staleTime: Infinity,
      })),
      combine: (results) => ({
        data:
          results.length > 0 && results.some((r) => r.data)
            ? ({
                clusters: results.flatMap((r) => r.data?.clusters ?? []),
                tasks: results.flatMap((r) => r.data?.tasks ?? []),
                overlappingTasks: results.flatMap((r) => r.data?.overlappingTasks ?? []),
                totalCount: results.reduce((sum, r) => sum + (r.data?.totalCount ?? 0), 0),
              } as TaskTilesResponse)
            : undefined,
        isLoading: results.some((r) => r.isLoading),
      }),
    })

    return usePerTileCache ? tilesResult : singleResult
  },
}
