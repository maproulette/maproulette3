import React, { Component } from 'react'
import { LatLngBounds } from 'leaflet'
import _get from 'lodash/get'
import _find from 'lodash/find'
import { chooseVisibleTask, mapDispatchToProps, } from './WithStartChallenge'
import AsEndUser from '../../../interactions/User/AsEndUser'
import { denormalize } from 'normalizr'
import { loadRandomTaskFromChallenge } from '../../../services/Task/Task'
import { changeVisibleLayer } from '../../../services/VisibleLayer/VisibleLayer'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'

jest.mock('../../../services/Task/Task')
jest.mock('../../../services/VisibleLayer/VisibleLayer')
jest.mock('../../../services/Error/Error')

let basicState = null
let challenge = null
let taskInBoundsCreated = null
let taskInBoundsSkipped = null
let taskOutOfBounds = null
let clusteredTasks = null
let WrappedComponent = null

beforeEach(() => {
  challenge = {id: 123}

  basicState = {
    mapBounds: {
      challengeId: challenge.id,
      bounds: new LatLngBounds({lng: -10, lat: 10}, {lng: 10, lat: -10}),
      zoom: 3,
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

  clusteredTasks = {
    challengeId: challenge.id,
    loading: false,
    tasks: [
      taskInBoundsCreated,
      taskInBoundsSkipped,
      taskOutOfBounds,
    ],
  }
})

test("chooseVisibleTask opts for a created task within the challenge bounds", () => {
  expect(
    chooseVisibleTask(challenge,
                      basicState.mapBounds,
                      clusteredTasks)
).toEqual(taskInBoundsCreated)
})

test("chooseVisibleTask will choose a skipped status if no created are available", () => {
  taskInBoundsCreated.status = TaskStatus.alreadyFixed

  expect(
    chooseVisibleTask(challenge,
                      basicState.mapBounds,
                      clusteredTasks)
  ).toEqual(taskInBoundsSkipped)
})

test("chooseVisibleTask skips tasks not in a created or skipped status", () => {
  taskInBoundsCreated.status = TaskStatus.alreadyFixed
  taskInBoundsSkipped.status = TaskStatus.alreadyFixed

  expect(
   chooseVisibleTask(challenge,
                     basicState.mapBounds,
                     clusteredTasks)
  ).toBeFalsy()
})
