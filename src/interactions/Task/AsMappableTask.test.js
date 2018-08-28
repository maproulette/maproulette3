import React, { Component } from 'react'
import { point, featureCollection } from '@turf/helpers'
import AsMappableTask from './AsMappableTask'

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
    const wrappedTask = AsMappableTask(task)

    expect(wrappedTask.hasGeometries()).toBe(false)
  })

  test("returns false if the geometry is a FeatureCollection with null features", () => {
    task.geometries = {"type": "FeatureCollection", features: null}
    const wrappedTask = AsMappableTask(task)

    expect(wrappedTask.hasGeometries()).toBe(false)
  })

  test("returns true if the geometries are valid", () => {
    task.geometries = {"type": "FeatureCollection", features: []}
    const wrappedTask = AsMappableTask(task)

    expect(wrappedTask.hasGeometries()).toBe(true)
  })
})

describe("allFeatureProperties", () => {
  test("returns empty array if there are no features", () => {
    task.geometries = {"type": "FeatureCollection", features: null}
    const wrappedTask = AsMappableTask(task)

    expect(wrappedTask.allFeatureProperties()).toHaveLength(0)
  })

  test("returns an object containing the task's feature properties", () => {
    task.geometries = {"type": "FeatureCollection", features: [{
      properties: {
        foo: "abc",
        bar: "def",
      },
    }, {
      properties: {
        baz: "ghi",
      }
    }]}

    const wrappedTask = AsMappableTask(task)
    expect(wrappedTask.allFeatureProperties()).toEqual({
      foo: "abc",
      bar: "def",
      baz: "ghi",
    })
  })

  test("later feature properties overwrite earlier ones with same name", () => {
    task.geometries = {"type": "FeatureCollection", features: [
      { properties: { foo: "abc" } }, { properties: { foo: "xyz" } }
    ]}

    const wrappedTask = AsMappableTask(task)
    expect(wrappedTask.allFeatureProperties()).toEqual({ foo: "xyz" })
  })
})

describe("calculateCenterPoint()", () => {
  test("the task's location is returned as (Lat,Lng)", () => {
    task.location = {
      coordinates: [lng, lat],
    }

    const wrappedTask = AsMappableTask(task)
    expect(wrappedTask.calculateCenterPoint()).toEqual({lat, lng})
  })

  test("lacking a location, a centerpoint is computed from the task's features", () => {
    task.geometries = featureCollection([
      point([lng - 10, lat - 10]),
      point([lng - 10, lat + 10]),
      point([lng + 10, lat + 10]),
      point([lng + 10, lat - 10])
    ])
  
    const wrappedTask = AsMappableTask(task)
    expect(wrappedTask.calculateCenterPoint()).toEqual({lat, lng})
  })

  test("lacking a location and features, centerpoint defaults to (0, 0)", () => {
    const wrappedTask = AsMappableTask(task)
    expect(wrappedTask.calculateCenterPoint()).toEqual({lat: 0, lng: 0})
  })

  test("an undefined task defaults to (0, 0)", () => {
    const wrappedTask = AsMappableTask(undefined)
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

    const wrappedTask = AsMappableTask(task)
    expect(
      wrappedTask.calculateBBox()
    ).toEqual([lng - 10, lat - 10, lng + 10, lat + 10])
  })

  test("returns a bounding box of the centerpoint if no geometries", () => {
    task.location = {
      coordinates: [lng, lat],
    }

    const wrappedTask = AsMappableTask(task)
    expect(
      wrappedTask.calculateBBox()
    ).toEqual([lng, lat, lng, lat])
  })
})
