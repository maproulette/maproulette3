// import type { paths } from './api'

import type { components, operations, paths } from './openApiTypes'

/* Responses */
export type ProjectGetResponse =
  paths['/project/{id}']['get']['responses']['200']['content']['application/json']

/*  Parameters  */
export type ProjectGetParams =
  operations['project_retrieves_an_already_existing_project']['parameters']['path']

/* Types From API (isArchived supported by API but not in generated schema) */
export type Project = components['schemas']['Project'] & { isArchived?: boolean }
