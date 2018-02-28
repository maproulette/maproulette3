import React from 'react'
import _cloneDeep from 'lodash/cloneDeep'
import { toLatLngBounds } from '../../services/MapBounds/MapBounds'
import { ChallengeLocation }
       from '../../services/Challenge/ChallengeLocation/ChallengeLocation'
import { LocatorMap } from './LocatorMap'

let basicProps = null

beforeEach(() => {
  basicProps = {
    mapBounds: {
      locator: {
        bounds: toLatLngBounds([0, 0, 0, 0]),
      }
    },
    layerSourceId: "foo",
    setLocatorMapBounds: jest.fn(),
    updateBoundedChallenges: jest.fn(),
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

test("rerenders if the default layer id changes", () => {
  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  const newProps = _cloneDeep(basicProps)
  newProps.layerSourceId = 'bar'

  expect(wrapper.instance().shouldComponentUpdate(newProps)).toBe(true)
})

test("moving the map signals that the locator map bounds should be updated", () => {
  const bounds = [0, 0, 0, 0]
  const zoom = 3

  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  wrapper.instance().updateBounds(bounds, zoom, false)
  expect(basicProps.setLocatorMapBounds).toBeCalledWith(bounds, zoom, false)
})

test("moving the map signals that the challenges should be updated if filtering on map bounds", () => {
  basicProps.challengeFilter = {location: ChallengeLocation.withinMapBounds}
  const bounds = [0, 0, 0, 0]
  const zoom = 3

  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  wrapper.instance().updateBounds(bounds, zoom, false)
  expect(basicProps.updateBoundedChallenges).toBeCalledWith(bounds)
})

test("moving the map doesn't signal challenges updates if not filtering on map bounds", () => {
  const bounds = [0, 0, 0, 0]
  const zoom = 3

  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  wrapper.instance().updateBounds(bounds, zoom, false)
  expect(basicProps.updateBoundedChallenges).not.toBeCalled()
})
