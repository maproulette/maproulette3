import { describe, expect, it } from 'vitest'
import type { TaskCluster, TaskMarker } from '@/types/Task'
import {
  buildSelectedTaskCollection,
  calculateTaskCount,
  convertTaskMarkersToGeoJSON,
  isTaskEligibleForBundle,
  isValidLocation,
  processMarkersData,
  TASK_STATUS,
} from './utils.ts'

const marker = (overrides: Partial<TaskMarker> = {}): TaskMarker => ({
  id: 1,
  location: { lng: 10, lat: 20 },
  status: TASK_STATUS.CREATED,
  priority: 0,
  ...overrides,
})

const cluster = (overrides: Partial<TaskCluster> = {}): TaskCluster => ({
  clusterId: 1,
  numberOfPoints: 5,
  point: { lng: 10, lat: 20 },
  bounding: {},
  ...overrides,
})

describe('isTaskEligibleForBundle', () => {
  it('is eligible when unlocked, unbundled, and status is bundle-eligible', () => {
    expect(isTaskEligibleForBundle({ status: TASK_STATUS.CREATED }, null, 1)).toBe(true)
    expect(isTaskEligibleForBundle({ status: TASK_STATUS.SKIPPED }, null, 1)).toBe(true)
    expect(isTaskEligibleForBundle({ status: TASK_STATUS.TOO_HARD }, null, 1)).toBe(true)
  })

  it('is ineligible when locked by a different user', () => {
    expect(
      isTaskEligibleForBundle({ status: TASK_STATUS.CREATED, lockedBy: 2 }, null, 1)
    ).toBe(false)
  })

  it('is eligible when locked by the current user', () => {
    expect(
      isTaskEligibleForBundle({ status: TASK_STATUS.CREATED, lockedBy: 1 }, null, 1)
    ).toBe(true)
  })

  it('is eligible when lockedBy or currentUserId is null/undefined', () => {
    expect(
      isTaskEligibleForBundle({ status: TASK_STATUS.CREATED, lockedBy: null }, null, 1)
    ).toBe(true)
    expect(
      isTaskEligibleForBundle({ status: TASK_STATUS.CREATED, lockedBy: 2 }, null, null)
    ).toBe(true)
  })

  it('is ineligible when bundleId does not match the primary task', () => {
    expect(
      isTaskEligibleForBundle({ status: TASK_STATUS.CREATED, bundleId: 5 }, 6, 1)
    ).toBe(false)
  })

  it('treats null and undefined bundleId as equivalent', () => {
    expect(
      isTaskEligibleForBundle({ status: TASK_STATUS.CREATED, bundleId: null }, undefined, 1)
    ).toBe(true)
  })

  it('is eligible when bundleId matches the primary task', () => {
    expect(
      isTaskEligibleForBundle({ status: TASK_STATUS.CREATED, bundleId: 5 }, 5, 1)
    ).toBe(true)
  })

  it('is ineligible for statuses outside the bundle-eligible set', () => {
    expect(isTaskEligibleForBundle({ status: TASK_STATUS.FIXED }, null, 1)).toBe(false)
    expect(isTaskEligibleForBundle({ status: TASK_STATUS.FALSE_POSITIVE }, null, 1)).toBe(false)
    expect(isTaskEligibleForBundle({ status: TASK_STATUS.DELETED }, null, 1)).toBe(false)
    expect(isTaskEligibleForBundle({ status: TASK_STATUS.ALREADY_FIXED }, null, 1)).toBe(false)
  })
})

describe('buildSelectedTaskCollection', () => {
  const notSpidered = { has: () => false }
  const spideredSet = { has: (id: number) => id === 1 }

  it('returns an empty collection when marker is null or undefined', () => {
    expect(buildSelectedTaskCollection(null, notSpidered)).toEqual({
      type: 'FeatureCollection',
      features: [],
    })
    expect(buildSelectedTaskCollection(undefined, notSpidered)).toEqual({
      type: 'FeatureCollection',
      features: [],
    })
  })

  it('returns an empty collection when the marker has no location', () => {
    const noLocation = marker({ location: undefined as unknown as TaskMarker['location'] })
    expect(buildSelectedTaskCollection(noLocation, notSpidered)).toEqual({
      type: 'FeatureCollection',
      features: [],
    })
  })

  it('returns an empty collection when the marker is spidered', () => {
    expect(buildSelectedTaskCollection(marker({ id: 1 }), spideredSet)).toEqual({
      type: 'FeatureCollection',
      features: [],
    })
  })

  it('builds a single-feature collection for a valid, non-spidered marker', () => {
    const result = buildSelectedTaskCollection(marker({ id: 1, priority: 2 }), notSpidered)
    expect(result).toEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [10, 20] },
          properties: { id: 1, status: TASK_STATUS.CREATED, priority: 2 },
        },
      ],
    })
  })
})

describe('convertTaskMarkersToGeoJSON', () => {
  it('converts a TaskMarker into a non-cluster point feature', () => {
    const result = convertTaskMarkersToGeoJSON([
      marker({ id: 1, bundleId: 3, lockedBy: 4 }),
    ])
    expect(result.features).toHaveLength(1)
    expect(result.features[0]).toMatchObject({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [10, 20] },
      properties: {
        id: 1,
        status: TASK_STATUS.CREATED,
        priority: 0,
        bundleId: 3,
        lockedBy: 4,
        cluster: false,
        isOverlapping: false,
        isSelected: false,
        isHovered: false,
        isHighlighted: false,
      },
    })
  })

  it('defaults bundleId and lockedBy to null when absent', () => {
    const result = convertTaskMarkersToGeoJSON([marker({ id: 1 })])
    expect(result.features[0].properties).toMatchObject({ bundleId: null, lockedBy: null })
  })

  it('converts a TaskCluster into a cluster point feature', () => {
    const result = convertTaskMarkersToGeoJSON([
      cluster({ clusterId: 7, numberOfPoints: 12, taskStatus: TASK_STATUS.SKIPPED }),
    ])
    expect(result.features).toHaveLength(1)
    expect(result.features[0]).toMatchObject({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [10, 20] },
      properties: {
        id: 7,
        status: TASK_STATUS.SKIPPED,
        priority: 0,
        point_count: 12,
        taskCount: 12,
        cluster: true,
      },
    })
  })

  it('defaults cluster taskStatus to 0 when absent', () => {
    const result = convertTaskMarkersToGeoJSON([
      cluster({ clusterId: 7, taskStatus: null as unknown as number }),
    ])
    expect(result.features[0].properties).toMatchObject({ status: 0 })
  })

  it('skips items with neither location nor point', () => {
    const result = convertTaskMarkersToGeoJSON([{} as TaskMarker])
    expect(result.features).toHaveLength(0)
  })

  it('handles a mix of markers and clusters', () => {
    const result = convertTaskMarkersToGeoJSON([marker({ id: 1 }), cluster({ clusterId: 2 })])
    expect(result.features).toHaveLength(2)
    expect(result.type).toBe('FeatureCollection')
  })
})

describe('calculateTaskCount', () => {
  it('returns 0 for null/undefined/falsy input', () => {
    expect(calculateTaskCount(null)).toBe(0)
    expect(calculateTaskCount(undefined)).toBe(0)
  })

  it('uses totalCount when present', () => {
    expect(calculateTaskCount({ totalCount: 42 })).toBe(42)
  })

  it('counts a bare array of markers', () => {
    expect(calculateTaskCount([marker(), marker()])).toBe(2)
  })

  it('counts a `tasks` array', () => {
    expect(calculateTaskCount({ tasks: [marker(), marker(), marker()] })).toBe(3)
  })

  it('counts a `markers` array', () => {
    expect(calculateTaskCount({ markers: [marker()] })).toBe(1)
  })

  it('counts a `clusters` array by summing numberOfPoints', () => {
    expect(calculateTaskCount({ clusters: [cluster({ numberOfPoints: 5 })] })).toBe(5)
  })

  it('sums numberOfPoints when the array holds clusters', () => {
    expect(
      calculateTaskCount({
        clusters: [cluster({ numberOfPoints: 3 }), cluster({ numberOfPoints: 4 })],
      })
    ).toBe(7)
  })

  it('returns 0 for an unrecognized object shape', () => {
    expect(calculateTaskCount({ foo: 'bar' })).toBe(0)
  })
})

describe('processMarkersData', () => {
  it('returns empty results for falsy input', () => {
    expect(processMarkersData(null)).toEqual({ markers: [], clusters: [], overlapMarkers: [] })
  })

  it('handles the new backend shape with markers and overlaps arrays', () => {
    const m = marker({ id: 1 })
    const overlap = { tasks: [marker({ id: 2 })], location: { lng: 1, lat: 2 } }
    const result = processMarkersData({ markers: [m], overlaps: [overlap] })
    expect(result).toEqual({ markers: [m], clusters: [], overlapMarkers: [overlap] })
  })

  it('defaults to empty arrays when new-shape fields are not arrays', () => {
    const result = processMarkersData({ markers: 'nope', overlaps: null })
    expect(result).toEqual({ markers: [], clusters: [], overlapMarkers: [] })
  })

  it('classifies legacy items with numberOfPoints/taskCount as clusters', () => {
    const c = cluster({ clusterId: 1 })
    const result = processMarkersData([c])
    expect(result.clusters).toEqual([c])
    expect(result.markers).toEqual([])
  })

  it('classifies legacy items with a tasks array as new-format overlap markers', () => {
    const tasks = [marker({ id: 1 }), marker({ id: 2 })]
    const location = { lng: 1, lat: 2 }
    const result = processMarkersData([{ location, tasks }])
    expect(result.overlapMarkers).toEqual([{ tasks, location }])
  })

  it('converts legacy items with an ids array into overlap markers with synthesized tasks', () => {
    const location = { lng: 1, lat: 2 }
    const result = processMarkersData([{ location, ids: [10, 20] }])
    expect(result.overlapMarkers).toEqual([
      {
        tasks: [
          { id: 10, location, status: 0, priority: 0 },
          { id: 20, location, status: 0, priority: 0 },
        ],
        location,
      },
    ])
  })

  it('classifies legacy items with an id as single markers', () => {
    const m = marker({ id: 5 })
    const result = processMarkersData([m])
    expect(result.markers).toEqual([m])
  })

  it('unwraps a legacy `tasks` container before classifying items', () => {
    const m = marker({ id: 5 })
    const result = processMarkersData({ tasks: [m] })
    expect(result.markers).toEqual([m])
  })

  it('unwraps a legacy `markers` container before classifying items', () => {
    const m = marker({ id: 5 })
    const result = processMarkersData({ markers: [m] })
    expect(result.markers).toEqual([m])
  })

  it('unwraps a legacy `clusters` container before classifying items', () => {
    const c = cluster({ clusterId: 5 })
    const result = processMarkersData({ clusters: [c] })
    expect(result.clusters).toEqual([c])
  })
})

describe('isValidLocation', () => {
  it('is true for a finite numeric location', () => {
    expect(isValidLocation({ lng: 1, lat: 2 })).toBe(true)
  })

  it('is false for null or undefined', () => {
    expect(isValidLocation(null)).toBe(false)
    expect(isValidLocation(undefined)).toBe(false)
  })

  it('is false for NaN coordinates', () => {
    expect(isValidLocation({ lng: NaN, lat: 2 })).toBe(false)
    expect(isValidLocation({ lng: 1, lat: NaN })).toBe(false)
  })

  it('is false for non-finite coordinates', () => {
    expect(isValidLocation({ lng: Infinity, lat: 2 })).toBe(false)
    expect(isValidLocation({ lng: 1, lat: -Infinity })).toBe(false)
  })

  it('is false for non-numeric coordinates', () => {
    expect(isValidLocation({ lng: '1' as unknown as number, lat: 2 })).toBe(false)
  })
})
