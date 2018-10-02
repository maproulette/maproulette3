import React from 'react'
import _cloneDeep from 'lodash/cloneDeep'
import { toLatLngBounds } from '../../services/MapBounds/MapBounds'
import { ChallengeLocation }
       from '../../services/Challenge/ChallengeLocation/ChallengeLocation'
import { ChallengeMap } from './ChallengeMap'

let basicProps = null
let challenge = null

beforeEach(() => {
  challenge = {id: 123}

  basicProps = {
    browsedChallenge: challenge,
    mapBounds: {
      challenge: {
        challengeId: challenge.id,
        bounds: toLatLngBounds([0, 0, 0, 0]),
      }
    },
    source: {id: 'foo'},
    visibleOverlays: [],
    taskMarkers: [],
    setChallengeMapBounds: jest.fn(),
    updateBoundedChallenges: jest.fn(),
  }
})

test("it renders a full screen map", () => {
  const wrapper = shallow(
    <ChallengeMap {...basicProps} />
  )

  expect(wrapper.find('.full-screen-map').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't rerender simply because the map bounds change", () => {
  const wrapper = shallow(
    <ChallengeMap {...basicProps} />
  )

  const newProps = _cloneDeep(basicProps)
  newProps.mapBounds.challenge.bounds = toLatLngBounds([-20, -20, 20, 20])

  expect(wrapper.instance().shouldComponentUpdate(newProps)).toBe(false)
})

test("rerenders if the default layer id changes", () => {
  const wrapper = shallow(
    <ChallengeMap {...basicProps} />
  )

  const newProps = _cloneDeep(basicProps)
  newProps.source = {id: 'bar'}

  expect(wrapper.instance().shouldComponentUpdate(newProps)).toBe(true)
})

test("rerenders if the challenge being browsed changes", () => {
  const wrapper = shallow(
    <ChallengeMap {...basicProps} />
  )

  const newProps = _cloneDeep(basicProps)
  newProps.browsedChallenge = {id: 456}

  expect(wrapper.instance().shouldComponentUpdate(newProps)).toBe(true)
})

test("rerenders if the challenge's tasks have loaded", () => {
  basicProps.tasksLoading = true
  const wrapper = shallow(
    <ChallengeMap {...basicProps} />
  )

  const newProps = _cloneDeep(basicProps)
  newProps.tasksLoading = false

  expect(wrapper.instance().shouldComponentUpdate(newProps)).toBe(true)
})

test("moving the map signals that the challenge bounds are to be updated", () => {
  const bounds = [0, 0, 0, 0]
  const zoom = 3

  const wrapper = shallow(
    <ChallengeMap {...basicProps} />
  )

  wrapper.instance().updateBounds(bounds, zoom, false)
  expect(
    basicProps.setChallengeMapBounds
  ).toBeCalledWith(basicProps.browsedChallenge.id, bounds, zoom)
})

test("a busy indicator is displayed if tasks are loading", () => {
  basicProps.tasksLoading = true

  const wrapper = shallow(
    <ChallengeMap {...basicProps} />
  )

  expect(wrapper.find('BusySpinner').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("the busy indicator is removed once tasks are done loading", () => {
  basicProps.tasksLoading = false

  const wrapper = shallow(
    <ChallengeMap {...basicProps} />
  )

  expect(wrapper.find('BusySpinner').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})
