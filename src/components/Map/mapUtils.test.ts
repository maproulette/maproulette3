import { describe, expect, it } from 'vitest'
import type { Bbox2D } from '@/types/Map'
import { coordInBbox } from './mapUtils.ts'

const BBOX: Bbox2D = [-100, 30, -90, 40]

describe('coordInBbox', () => {
  it('returns true for a coordinate inside the bbox', () => {
    expect(coordInBbox([-95, 35], BBOX)).toBe(true)
  })

  it('returns false for a coordinate outside the bbox', () => {
    expect(coordInBbox([-80, 35], BBOX)).toBe(false)
    expect(coordInBbox([-95, 50], BBOX)).toBe(false)
  })

  it('treats the boundary as inside', () => {
    expect(coordInBbox([-100, 35], BBOX)).toBe(true)
    expect(coordInBbox([-90, 35], BBOX)).toBe(true)
    expect(coordInBbox([-95, 30], BBOX)).toBe(true)
    expect(coordInBbox([-95, 40], BBOX)).toBe(true)
  })

  it('treats the corners as inside', () => {
    expect(coordInBbox([-100, 30], BBOX)).toBe(true)
    expect(coordInBbox([-100, 40], BBOX)).toBe(true)
    expect(coordInBbox([-90, 30], BBOX)).toBe(true)
    expect(coordInBbox([-90, 40], BBOX)).toBe(true)
  })

  it('correctly handles coordinates just inside or outside the bbox', () => {
    expect(coordInBbox([-99.9999, 35], BBOX)).toBe(true)
    expect(coordInBbox([-90.0001, 35], BBOX)).toBe(true)
    expect(coordInBbox([-100.0001, 35], BBOX)).toBe(false)
    expect(coordInBbox([-89.9999, 35], BBOX)).toBe(false)
  })
})
