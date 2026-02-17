import type { components, operations, paths } from './openApiTypes'

/* Responses */
export type TaskStartResponse =
  paths['/task/{id}/start']['get']['responses']['200']['content']['application/json']
export type TaskGetResponse =
  paths['/task/{id}']['get']['responses']['200']['content']['application/json']
export type TaskMarkersResponse =
  paths['/taskMarkers']['get']['responses']['200']['content']['application/json']
export type TasksInBoundsResponse =
  paths['/tasks/bounds']['get']['responses']['200']['content']['application/json']

/*  Parameters  */
export type TaskStartParams =
  operations['task_start_working_on_a_task_locks_it_for_the_user']['parameters']['path']
export type TaskGetParams =
  operations['task_retrieves_an_already_existing_task']['parameters']['path']
export type ChallengeTaskMarkersParams = operations['challenge_task_markers']['parameters']['path']
export type TaskMarkersParams = operations['task_marker_Data']['parameters']['query']
export type TasksInBoundsParams =
  operations['task_get_challenge_tasks_in_bounds']['parameters']['query']

/* Types From API */
export type TaskMarker = components['schemas']['org.maproulette.framework.model.TaskMarker']
export type OverlapMarker =
  components['schemas']['org.maproulette.framework.model.OverlapTaskMarker']
export type TaskCluster =
  components['schemas']['org.maproulette.framework.model.TaskClusterSummary']
export type Task = components['schemas']['org.maproulette.framework.model.Task']

/* Custom Types */
export type TaskHistoryAction = {
  taskId: number
  timestamp: string
  actionType: number
  user: {
    id: number
    osmProfile: {
      id: number
      displayName: string
      avatarURL?: string
    }
  } | null
  oldStatus?: number
  status?: number
  startedAt?: string
  // Comment can be either an object or the raw comment text string
  comment?:
    | string
    | {
        id: number
        osm_id: number
        osm_username: string
        avatarUrl?: string
        taskId: number
        challengeId: number
        projectId: number
        created: number
        comment: string
        actionId?: number
      }
}

export type Point = {
  type: 'Point'
  coordinates: [number, number]
}

export type LineString = {
  type: 'LineString'
  coordinates: [number, number][]
}

export type Polygon = {
  type: 'Polygon'
  coordinates: [number, number][][]
}

export type Geometry = Point | LineString | Polygon

/* Task Tiles Types (derived from OpenAPI spec) */
export type TaskTilesParams = operations['task_get_task_tiles']['parameters']['query'] &
  operations['task_get_task_tiles']['parameters']['path']

export type TaskTilesResponse =
  paths['/taskTiles/{z}']['get']['responses']['200']['content']['application/json']

export type OverlappingTaskGroup =
  components['schemas']['org.maproulette.framework.model.OverlappingTaskMarker']
