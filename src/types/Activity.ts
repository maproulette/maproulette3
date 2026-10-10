import type { paths } from './openApiTypes'

export type ActivityItem =
  paths['/data/user/activity']['get']['responses']['200']['content']['application/json'][number]
