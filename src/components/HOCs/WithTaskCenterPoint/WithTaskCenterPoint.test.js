import React, { Component } from 'react'
import { point, featureCollection } from '@turf/helpers'
import WithTaskCenterPoint from './WithTaskCenterPoint'

const lat = 20
const lng = 30
let WrappedComponent = null
let task = null

beforeEach(() => {
  task = {
    id: 123,
  }

  WrappedComponent = WithTaskCenterPoint(() => <div className="child-control" />)
})

test("the task's location is passed through as (Lat,Lng) to the wrapped component", () => {
  task.location = {
    coordinates: [lng, lat],
  }

  const wrapper = shallow(
    <WrappedComponent task={task} />
  )

  expect(wrapper.props().centerPoint).toEqual({lat, lng})
})

test("lacking a location, a centerpoint is computed from the task's features", () => {
  task.geometries = featureCollection([
    point([lng - 10, lat - 10]),
    point([lng - 10, lat + 10]),
    point([lng + 10, lat + 10]),
    point([lng + 10, lat - 10])
  ])
 
  const wrapper = shallow(
    <WrappedComponent task={task} />
  )

  expect(wrapper.props().centerPoint).toEqual({lat, lng})
})

test("lacking a location and features, centerpoint defaults to (0, 0)", () => {
  const wrapper = shallow(
    <WrappedComponent task={task} />
  )

  expect(wrapper.props().centerPoint).toEqual({lat: 0, lng: 0})
})
