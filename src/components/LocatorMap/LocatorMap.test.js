import React from 'react'
import { cloneDeep as _cloneDeep } from 'lodash'
import { toLatLngBounds } from '../../services/MapBounds/MapBounds'
import { LocatorMap } from './LocatorMap'

let basicProps = null

beforeEach(() => {
  basicProps = {
    mapBounds: {
      locator: {
        bounds: toLatLngBounds([0, 0, 0, 0]),
      }
    },
    layerSourceName: "foo",
    setLocatorMapBounds: jest.fn(),
  }
})

test("it renders a full screen map", () => {
  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  expect(wrapper.find('.full-screen-map').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't rerender simply because the map bounds change", () => {
  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  const newProps = _cloneDeep(basicProps)
  newProps.mapBounds.locator.bounds = toLatLngBounds([-20, -20, 20, 20])

  expect(wrapper.instance().shouldComponentUpdate(newProps)).toBe(false)
})

test("rerenders if the map bounds change is response to an external user action", () => {
  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  const newProps = _cloneDeep(basicProps)
  newProps.mapBounds.locator.bounds = toLatLngBounds([-20, -20, 20, 20])
  newProps.mapBounds.locator.fromUserAction = true

  expect(wrapper.instance().shouldComponentUpdate(newProps)).toBe(true)
})

test("rerenders if the default layer name changes", () => {
  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  const newProps = _cloneDeep(basicProps)
  newProps.layerSourceName = 'bar'

  expect(wrapper.instance().shouldComponentUpdate(newProps)).toBe(true)
})
