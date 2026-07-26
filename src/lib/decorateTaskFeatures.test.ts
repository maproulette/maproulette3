import { describe, expect, it } from 'vitest'
import type { Task } from '@/types/Task'
import { decorateTaskFeatures } from './decorateTaskFeatures.ts'

const makeTask = (features: GeoJSON.Feature[]): Task =>
  ({
    id: 42,
    geometries: { type: 'FeatureCollection', features },
  }) as Task

describe('decorateTaskFeatures', () => {
  it('stamps taskId onto each feature while preserving existing properties', () => {
    const feature: GeoJSON.Feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [1, 2] },
      properties: { name: 'a' },
    }
    const task = makeTask([feature])

    const result = decorateTaskFeatures(task)

    expect(result.type).toBe('FeatureCollection')
    expect(result.features).toHaveLength(1)
    expect(result.features[0].properties).toEqual({ name: 'a', taskId: 42 })
    expect(result.features[0].geometry).toEqual(feature.geometry)
  })

  it('decorates every feature when the task has multiple features', () => {
    const task = makeTask([
      { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: null },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [1, 1] }, properties: { a: 1 } },
    ])

    const result = decorateTaskFeatures(task)

    expect(result.features).toHaveLength(2)
    expect(result.features[0].properties).toEqual({ taskId: 42 })
    expect(result.features[1].properties).toEqual({ a: 1, taskId: 42 })
  })

  it('returns an empty feature collection when the task has no features', () => {
    const task = makeTask([])

    const result = decorateTaskFeatures(task)

    expect(result).toEqual({ type: 'FeatureCollection', features: [] })
  })

  it('does not mutate the original task features', () => {
    const feature: GeoJSON.Feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [1, 2] },
      properties: { name: 'a' },
    }
    const task = makeTask([feature])

    decorateTaskFeatures(task)

    expect(feature.properties).toEqual({ name: 'a' })
  })
})
