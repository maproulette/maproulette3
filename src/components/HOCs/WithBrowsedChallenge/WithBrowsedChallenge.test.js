import React, { Component } from 'react'
import { LatLngBounds } from 'leaflet'
import _get from 'lodash/get'
import _find from 'lodash/find'
import { WithBrowsedChallenge,
         mapStateToProps, mapDispatchToProps, } from './WithBrowsedChallenge'
import AsEndUser from '../../../services/User/AsEndUser'
import { denormalize } from 'normalizr'
import { loadRandomTaskFromChallenge,
         fetchClusteredTasks } from '../../../services/Task/Task'
import { changeVisibleLayer } from '../../../services/VisibleLayer/VisibleLayer'
import { buildError, addError } from '../../../services/Error/Error'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'

jest.mock('../../../services/Task/Task')
jest.mock('../../../services/VisibleLayer/VisibleLayer')
jest.mock('../../../services/Error/Error')

let basicState = null
let challenge = null
let taskInBoundsCreated = null
let taskInBoundsSkipped = null
let taskOutOfBounds = null
let tasks = null
let WrappedComponent = null

beforeEach(() => {
  challenge = {id: 123}

  basicState = {
    mapBounds: {
      challenge: {
        challengeId: challenge.id,
        bounds: new LatLngBounds({lng: -10, lat: 10}, {lng: 10, lat: -10}),
        zoom: 3,
      }
    },
  }

  taskInBoundsCreated = {
    id: 987,
    parent: challenge.id,
    point: {lng: 7, lat: 8},
    status: TaskStatus.created,
  }

  taskInBoundsSkipped = {
    id: 654,
    parent: challenge.id,
    point: {lng: -1, lat: -5},
    status: TaskStatus.skipped,
  }

  taskOutOfBounds = {
    id: 321,
    parent: challenge.id,
    point: {lng: 20, lat: 30},
    status: TaskStatus.created,
  }

  tasks = [
    taskInBoundsCreated,
    taskInBoundsSkipped,
    taskOutOfBounds,
  ]

  WrappedComponent = WithBrowsedChallenge(() => <div className="child" />)
})

test("startBrowsing causes the given challenge to be passed down", () => {
  const challenge = {id: 123}
  const fetchTasks = jest.fn(challengeId => Promise.resolve([]))

  const wrapper = shallow(
    <WrappedComponent fetchClusteredTasks={fetchTasks} />
  )

  wrapper.instance().startBrowsingChallenge(challenge)
  wrapper.update()

  expect(wrapper.props().browsedChallenge).toEqual(challenge)
})

test("startBrowsing causes clustered tasks to be loaded", async () => {
  const fetchTasks = jest.fn(challengeId => Promise.resolve(tasks))

  const wrapper = shallow(
    <WrappedComponent fetchClusteredTasks={fetchTasks} />
  )

  await wrapper.instance().startBrowsingChallenge(challenge)
  wrapper.update()

  expect(fetchTasks).toHaveBeenCalledWith(challenge.id)
  expect(wrapper.instance().state.tasks).toEqual(tasks)
})

test("clustered tasks are passed down", async () => {
  const fetchTasks = jest.fn(challengeId => Promise.resolve(tasks))

  const wrapper = shallow(
    <WrappedComponent fetchClusteredTasks={fetchTasks} />
  )

  await wrapper.instance().startBrowsingChallenge(challenge)
  wrapper.update()

  expect(fetchTasks).toHaveBeenCalledWith(challenge.id)
  expect(wrapper.props().clusteredTasks).toEqual(tasks)
})

test("stopBrowsing removes the browsed challenge and tasks", async () => {
  const fetchTasks = jest.fn(challengeId => Promise.resolve(tasks))

  const wrapper = shallow(
    <WrappedComponent fetchClusteredTasks={fetchTasks} />
  )

  await wrapper.instance().startBrowsingChallenge(challenge)
  wrapper.update()
  expect(wrapper.instance().state.browsedChallenge).toEqual(challenge)
  expect(wrapper.instance().state.tasks).toEqual(tasks)

  wrapper.instance().stopBrowsingChallenge(challenge)
  wrapper.update()
  expect(wrapper.instance().state.browsedChallenge).toEqual(null)
  expect(wrapper.instance().state.tasks).toEqual([])
})

test("chooseVisibleTask opts for a created task within the challenge bounds", () => {
  const wrapper = shallow(
    <WrappedComponent mapBounds={basicState.mapBounds} />
  )

  wrapper.instance().setState({browsedChallenge: challenge, tasks: tasks})
  wrapper.update()

  expect(
    wrapper.instance().chooseVisibleTask(challenge)
  ).toEqual(taskInBoundsCreated)
})

test("chooseVisibleTask will choose a skipped status if no created are available", () => {
  const wrapper = shallow(
    <WrappedComponent mapBounds={basicState.mapBounds} />
  )

  taskInBoundsCreated.status = TaskStatus.alreadyFixed
  wrapper.instance().setState({browsedChallenge: challenge, tasks: tasks})
  wrapper.update()

  expect(
    wrapper.instance().chooseVisibleTask(challenge)
  ).toEqual(taskInBoundsSkipped)
})

test("chooseVisibleTask skips tasks not in a created or skipped status", () => {
  const wrapper = shallow(
    <WrappedComponent mapBounds={basicState.mapBounds} />
  )

  taskInBoundsCreated.status = TaskStatus.alreadyFixed
  taskInBoundsSkipped.status = TaskStatus.alreadyFixed
  wrapper.instance().setState({browsedChallenge: challenge, tasks: tasks})
  wrapper.update()

  expect(
    wrapper.instance().chooseVisibleTask(challenge)
  ).toBeFalsy()
})
