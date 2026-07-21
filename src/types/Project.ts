import type { CompletionMetrics } from './Challenge'
import type { components, paths } from './openApiTypes'

/* Responses */
export type ProjectGetResponse =
  paths['/project/{id}']['get']['responses']['200']['content']['application/json']

/* Types From API (isArchived supported by API but not in generated schema) */
export type Project = components['schemas']['Project'] & {
  isArchived?: boolean
  completionMetrics?: CompletionMetrics
}
