import React, { Component } from 'react'
import { point, featureCollection } from '@turf/helpers'
import AsMappable from './AsMappable'

const lat = 20
const lng = 30
let task = null

beforeEach(() => {
  task = {
    id: 123,
  }
})

describe("hasGeometries", () => {
  test("returns false if no geometries object", () => {
    delete task.geometries
    const wrappedTask = AsMappable(task)

    expect(wrappedTask.hasGeometries()).toBe(false)
  })

  test("returns false if the geometry is a FeatureCollection with null features", () => {
    task.geometries = {"type": "FeatureCollection", features: null}
    const wrappedTask = AsMappable(task)

    expect(wrappedTask.hasGeometries()).toBe(false)
  })

  test("returns true if the geometries are valid", () => {
    task.geometries = {"type": "FeatureCollection", features: []}
    const wrappedTask = AsMappable(task)

    expect(wrappedTask.hasGeometries()).toBe(true)
  })
})

describe("calculateCenterPoint()", () => {
  test("the task's location is returned as (Lat,Lng)", () => {
    task.location = {
      coordinates: [lng, lat],
    }

    const wrappedTask = AsMappable(task)
    expect(wrappedTask.calculateCenterPoint()).toEqual({lat, lng})
  })

  test("lacking a location, a centerpoint is computed from the task's features", () => {
    task.geometries = featureCollection([
      point([lng - 10, lat - 10]),
      point([lng - 10, lat + 10]),
      point([lng + 10, lat + 10]),
      point([lng + 10, lat - 10])
    ])
  
    const wrappedTask = AsMappable(task)
    expect(wrappedTask.calculateCenterPoint()).toEqual({lat, lng})
  })

  test("lacking a location and features, centerpoint defaults to (0, 0)", () => {
    const wrappedTask = AsMappable(task)
    expect(wrappedTask.calculateCenterPoint()).toEqual({lat: 0, lng: 0})
  })

  test("an undefined task defaults to (0, 0)", () => {
    const wrappedTask = AsMappable(undefined)
    expect(wrappedTask.calculateCenterPoint()).toEqual({lat: 0, lng: 0})
  })
})

describe("calculateBBox()", () => {
  test("returns a bounding box of the task geometries", () => {
    task.geometries = featureCollection([
      point([lng - 10, lat - 10]),
      point([lng - 10, lat + 10]),
      point([lng + 10, lat + 10]),
      point([lng + 10, lat - 10])
    ])

    const wrappedTask = AsMappable(task)
    expect(
      wrappedTask.calculateBBox()
    ).toEqual([lng - 10, lat - 10, lng + 10, lat + 10])
  })

  test("returns a bounding box of the centerpoint if no geometries", () => {
    task.location = {
      coordinates: [lng, lat],
    }

    const wrappedTask = AsMappable(task)
    expect(
      wrappedTask.calculateBBox()
    ).toEqual([lng, lat, lng, lat])
  })
})
