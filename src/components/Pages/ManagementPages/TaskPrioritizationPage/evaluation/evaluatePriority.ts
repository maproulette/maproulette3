import type {
  BinaryGroup,
  BinaryLeaf,
  BinaryNode,
} from '@/components/shared/TaskPropertyQueryBuilder/propertyRuleTypes'
import { TaskPriority, type TaskPriorityValue } from '@/types/Priority'
import { pointInFeatureCollection } from './pointInPolygon'

const isGroup = (node: BinaryNode): node is BinaryGroup =>
  (node as BinaryGroup).valueType === 'compound rule'

export interface TaskPreviewInput {
  id: number
  lng: number
  lat: number
  /** Current server-side priority, used to compute diff. */
  currentPriority: number | null | undefined
  /** Optional per-task properties; present when the caller has them (otherwise property rules abstain). */
  properties?: Record<string, unknown> | null
}

export interface TierConfig {
  priority: TaskPriorityValue
  rules: BinaryNode | null
  bounds: GeoJSON.FeatureCollection | null
}

export interface EvaluationConfig {
  defaultPriority: TaskPriorityValue
  tiers: TierConfig[]
}

const coerceNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const evaluateLeaf = (leaf: BinaryLeaf, task: TaskPreviewInput): boolean | 'abstain' => {
  const properties = task.properties
  // If caller passed no properties, property-based rules abstain (unknown),
  // which is treated as a non-match so the preview does not over-promise.
  if (!properties) return 'abstain'

  const actual = properties[leaf.key]
  const operator = leaf.operator
  if (operator === 'exists') return actual !== undefined && actual !== null && actual !== ''
  if (operator === 'missing') return actual === undefined || actual === null || actual === ''

  if (actual === undefined || actual === null) return false

  if (operator === 'equals') return String(actual) === leaf.value
  if (operator === 'notEqual') return String(actual) !== leaf.value
  if (operator === 'contains') return String(actual).includes(leaf.value)
  if (operator === 'greaterThan' || operator === 'lessThan') {
    const a = coerceNumber(actual)
    const b = coerceNumber(leaf.value)
    if (a === null || b === null) return false
    return operator === 'greaterThan' ? a > b : a < b
  }
  return false
}

/**
 * Evaluate a rule tree against a task. Returns boolean for a definitive answer,
 * or 'abstain' when the rules depend on data we don't have (e.g. tag properties).
 * Callers decide how to treat abstain — the preview treats it as non-match for
 * property rules, and honest "server will apply" messaging surfaces it.
 */
export const evaluateRuleTree = (
  node: BinaryNode | null,
  task: TaskPreviewInput
): boolean | 'abstain' => {
  if (!node) return false
  if (!isGroup(node)) return evaluateLeaf(node, task)
  const left = evaluateRuleTree(node.left, task)
  const right = evaluateRuleTree(node.right, task)
  if (node.condition === 'and') {
    if (left === false || right === false) return false
    if (left === 'abstain' || right === 'abstain') return 'abstain'
    return true
  }
  // or
  if (left === true || right === true) return true
  if (left === 'abstain' || right === 'abstain') return 'abstain'
  return false
}

const tierMatches = (tier: TierConfig, task: TaskPreviewInput): boolean => {
  const hasBounds = !!tier.bounds && (tier.bounds.features?.length ?? 0) > 0
  const hasRules = !!tier.rules
  if (!hasBounds && !hasRules) return false
  const inBounds = hasBounds ? pointInFeatureCollection(task.lng, task.lat, tier.bounds) : null
  const ruleResult = hasRules ? evaluateRuleTree(tier.rules, task) : null

  // Both present: AND together (matches MR3 semantics — bounds scope the rule)
  if (hasBounds && hasRules) {
    if (inBounds !== true) return false
    return ruleResult === true
  }
  if (hasBounds) return inBounds === true
  return ruleResult === true
}

/**
 * Resolve the effective priority for a task. Walks tiers top-down (HIGH → MEDIUM → LOW)
 * and returns the first matching tier's priority; otherwise returns the default.
 */
export const evaluatePriority = (
  task: TaskPreviewInput,
  config: EvaluationConfig
): TaskPriorityValue => {
  for (const tier of config.tiers) {
    if (tierMatches(tier, task)) return tier.priority
  }
  return config.defaultPriority
}

export { TaskPriority }
