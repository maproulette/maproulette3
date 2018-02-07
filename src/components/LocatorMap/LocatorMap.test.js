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
    layerSourceName: "foo",
    setLocatorMapBounds: jest.fn(),
    setChallengeMapBounds: jest.fn(),
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

test("rerenders if the default layer name changes", () => {
  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  const newProps = _cloneDeep(basicProps)
  newProps.layerSourceName = 'bar'

  expect(wrapper.instance().shouldComponentUpdate(newProps)).toBe(true)
})

test("rerenders if the challenge being browsed changes", () => {
  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  const newProps = _cloneDeep(basicProps)
  newProps.browsedChallenge = {id: 456}

  expect(wrapper.instance().shouldComponentUpdate(newProps)).toBe(true)
})

test("rerenders if the challenge's clustered tasks have loaded", () => {
  basicProps.loadingClusteredTasks = false

  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  const newProps = _cloneDeep(basicProps)
  newProps.loadingClusteredTasks = true

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
  expect(basicProps.setChallengeMapBounds).not.toBeCalled()
})

test("moving the map when browsing a challenge updates the challenge bounds", () => {
  basicProps.browsedChallenge = {id: 123}
  const bounds = [0, 0, 0, 0]
  const zoom = 3

  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  wrapper.instance().updateBounds(bounds, zoom, false)
  expect(
    basicProps.setChallengeMapBounds
  ).toBeCalledWith(basicProps.browsedChallenge.id, bounds, zoom)
  expect(basicProps.setLocatorMapBounds).not.toBeCalled()
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

test("a busy indicator is displayed if clustered tasks are loading", () => {
  basicProps.browsedChallenge = {id: 123}
  basicProps.loadingClusteredTasks = true

  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  expect(wrapper.find('BusySpinner').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("the busy indicator is removed once tasks are done loading", () => {
  basicProps.browsedChallenge = {id: 123}
  basicProps.loadingClusteredTasks = false

  const wrapper = shallow(
    <LocatorMap {...basicProps} />
  )

  expect(wrapper.find('BusySpinner').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})
