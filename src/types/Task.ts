import type { components, operations, paths } from './openApiTypes'

/* Responses */
export type TaskStartResponse = Task
export type TaskGetResponse = Task
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
/**
 * The OpenAPI spec types `geometries` and `location` as opaque records. In
 * practice the backend always returns GeoJSON: `geometries` is a Feature,
 * FeatureCollection, or bare Geometry, and `location` is a Point. Narrow here
 * so call sites don't need to cast.
 */
type RawTask = components['schemas']['org.maproulette.framework.model.Task']
export type Task = Omit<RawTask, 'geometries' | 'location'> & {
  geometries: GeoJSON.GeoJSON
  location?: GeoJSON.Point | null
}

/** PUT /tasks/box/... with includeTotal=true (same task payload as other task list APIs) */
export type TasksBoundingBoxResponse = {
  total: number
  tasks: Task[]
}

/** Query shape for {@link TasksBoundingBoxResponse} (path + search + filter lists). */
export type TasksBoundingBoxQuery = {
  left: number
  bottom: number
  right: number
  top: number
  challengeId: number
  limit: number
  page: number
  sort: string
  order: 'ASC' | 'DESC'
  taskStatuses: number[]
  priorities: number[]
  reviewStatuses: number[]
  metaReviewStatuses: number[]
}

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

/* Task Tiles Types — query params from OpenAPI, plus z/bounds used by the MVT source builder */
export type TaskTilesQueryParams = NonNullable<
  operations['task_get_task_tiles']['parameters']['query']
>
export type TaskTilesParams = TaskTilesQueryParams & {
  z: number
  bounds: string
}
