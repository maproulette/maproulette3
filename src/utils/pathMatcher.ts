import type { RouteParams } from '@/types/Plugin'

export interface PathMatchResult {
  matched: boolean
  params: RouteParams
}

/**
 * Matches a path pattern (e.g., '/tasks/:id/review') against an actual path (e.g., '/tasks/123/review')
 * and extracts route parameters
 *
 * @param pattern - The path pattern with optional :param placeholders
 * @param path - The actual path to match against
 * @returns Object indicating if matched and extracted parameters
 */
export function matchPath(pattern: string, path: string): PathMatchResult {
  const normalizedPattern =
    pattern.endsWith('/') && pattern.length > 1 ? pattern.slice(0, -1) : pattern
  const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path

  if (!normalizedPattern.includes(':')) {
    return {
      matched: normalizedPattern === normalizedPath,
      params: {},
    }
  }

  const patternSegments = normalizedPattern.split('/').filter(Boolean)
  const pathSegments = normalizedPath.split('/').filter(Boolean)

  if (patternSegments.length !== pathSegments.length) {
    return { matched: false, params: {} }
  }

  const params: RouteParams = {}

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i]
    const pathSegment = pathSegments[i]

    if (patternSegment.startsWith(':')) {
      const paramName = patternSegment.slice(1)
      params[paramName] = pathSegment
    } else if (patternSegment !== pathSegment) {
      return { matched: false, params: {} }
    }
  }

  return { matched: true, params }
}

/**
 * Check if a path pattern is valid
 * @param pattern - The path pattern to validate
 * @returns true if the pattern is valid
 */
export function isValidPathPattern(pattern: string): boolean {
  if (!pattern.startsWith('/')) {
    return false
  }

  const invalidPatterns = [/\/\//, /:\w+:\w+/, /^:|\/$:/]

  return !invalidPatterns.some((regex) => regex.test(pattern))
}
