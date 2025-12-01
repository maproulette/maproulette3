import type { components, operations, paths } from './openApiTypes'

/* Responses */
export type UserWhoamiResponse =
  paths['/user/whoami']['get']['responses']['200']['content']['application/json']
export type UserNotificationsResponse =
  paths['/user/{userId}/notifications']['get']['responses']['200']['content']['application/json']

export interface UserMetricsResponse {
  total?: number
  tasks?: {
    [key: string]: number
  }
  reviewTasks?: {
    [key: string]: number
  }
  reviewedTasks?: {
    [key: string]: number
  }
}
;['application/json']

export type UserSettings = components['schemas']['org.maproulette.framework.model.UserSettings']
export type UserProperties = Record<string, unknown>

/*  Parameters  */
// type UserWhoamiParams = operations['user_retrieves_current_user']['parameters']['path']
export type UserNotificationsParams =
  operations['notification_retrieves_users_notifications']['parameters']['query']

/* Types From API */
export type User = components['schemas']['org.maproulette.framework.model.User']
export type Notification = components['schemas']['org.maproulette.framework.model.UserNotification']
