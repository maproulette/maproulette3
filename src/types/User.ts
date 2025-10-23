import type { components, operations, paths } from './openApiTypes'

/* Responses */
export type UserWhoamiResponse =
  paths['/user/whoami']['get']['responses']['200']['content']['application/json']
export type UserNotificationsResponse =
  paths['/user/{userId}/notifications']['get']['responses']['200']['content']['application/json']

/*  Parameters  */
// type UserWhoamiParams = operations['user_retrieves_current_user']['parameters']['path']
export type UserNotificationsParams =
  operations['notification_retrieves_users_notifications']['parameters']['path']

/* Types From API */
export type User = components['schemas']['org.maproulette.framework.model.User']
export type Notification = components['schemas']['org.maproulette.framework.model.UserNotification']
