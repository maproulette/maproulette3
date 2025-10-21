import type { paths } from './api'

export type Project =
  paths['/project/{id}']['get']['responses']['200']['content']['application/json']

export type ProjectsList =
  paths['/projects']['get']['responses']['200']['content']['application/json']
