import React from 'react'
import _cloneDeep from 'lodash/cloneDeep'
import { toLatLngBounds } from '../../services/MapBounds/MapBounds'
import { ChallengeLocation }
       from '../../services/Challenge/ChallengeLocation/ChallengeLocation'
import { ChallengeSearchMap } from './ChallengeSearchMap'

let basicProps = null

beforeEach(() => {
  basicProps = {
    mapBounds: {
      bounds: toLatLngBounds([0, 0, 0, 0]),
    },
    source: {id: 'foo'},
    visibleOverlays: [],
    setChallengeSearchMapBounds: jest.fn(),
  }
})

test("it renders a full screen map", () => {
  const wrapper = shallow(
    <ChallengeSearchMap {...basicProps} />
  )

  expect(wrapper.find('.full-screen-map').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("rerenders if the map bounds change is response to an external user action", () => {
  const wrapper = shallow(
    <ChallengeSearchMap {...basicProps} />
  )

  const newProps = _cloneDeep(basicProps)
  newProps.mapBounds.bounds = toLatLngBounds([-20, -20, 20, 20])
  newProps.mapBounds.fromUserAction = true

  expect(wrapper.instance().shouldComponentUpdate(newProps)).toBe(true)
})

test("rerenders if the default layer id changes", () => {
  const wrapper = shallow(
    <ChallengeSearchMap {...basicProps} />
  )

  const newProps = _cloneDeep(basicProps)
  newProps.source = {id: 'bar'}

  expect(wrapper.instance().shouldComponentUpdate(newProps)).toBe(true)
})

test("moving the map signals that the challenge search map bounds should be updated", () => {
  const bounds = [0, 0, 0, 0]
  const zoom = 3

  const wrapper = shallow(
    <ChallengeSearchMap {...basicProps} />
  )

  wrapper.instance().updateBounds(bounds, zoom, false)
  expect(basicProps.setChallengeSearchMapBounds).toBeCalledWith(bounds, zoom, false)
})

test("moving the map signals that the challenges should be updated if filtering on map bounds", () => {
  basicProps.searchFilters = {location: ChallengeLocation.withinMapBounds}
  const bounds = [0, 0, 0, 0]
  const zoom = 3

  const wrapper = shallow(
    <ChallengeSearchMap {...basicProps} />
  )

  wrapper.instance().updateBounds(bounds, zoom, false)
  expect(basicProps.setChallengeSearchMapBounds).toBeCalledWith(bounds, zoom, false)
})
