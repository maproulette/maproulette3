import React, { Component } from 'react'
import { LatLngBounds } from 'leaflet'
import _get from 'lodash/get'
import _find from 'lodash/find'
import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import { WithBrowsedChallenge,
         mapStateToProps, mapDispatchToProps, } from './WithBrowsedChallenge'
import AsEndUser from '../../../interactions/User/AsEndUser'
import { denormalize } from 'normalizr'
import { loadRandomTaskFromChallenge } from '../../../services/Task/Task'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'

let basicState = null
let challenge = null
let challenges = null
let WrappedComponent = null
let history = null
let match = null
let fetchTasks = null
let loadChallenge = null
let loadChallengeActions = null

beforeEach(() => {
  challenges = [
    {
      id: 123,
      _meta: {fetchedAt: Date.now()},
    },
    {
      id: 456,
      _meta: {fetchedAt: Date.now()},
    },
    {
      id: 789,
      _meta: {fetchedAt: Date.now()},
    },
  ]

  challenge = challenges[0]

  basicState = {
    mapBounds: {
      challenge: {
        challengeId: challenge.id,
        bounds: new LatLngBounds({lng: -10, lat: 10}, {lng: 10, lat: -10}),
        zoom: 3,
      }
    },
    entities: {
      challenges: _fromPairs(_map(challenges, challenge => [challenge.id, challenge]))
    }
  }

  match = {
    params: {
      challengeId: challenge.id,
    }
  }

  history = {
    push: jest.fn(),
  }

  fetchTasks = jest.fn()
  loadChallenge = jest.fn()
  loadChallengeActions = jest.fn()

  WrappedComponent = WithBrowsedChallenge(() => <div className="child" />)
})

test("the browsed challenge from the route match is passed down", () => {
  const wrapper = shallow(
    <WrappedComponent match={match}
                      entities={basicState.entities}
                      loadChallenge={loadChallenge}
                      loadChallengeActions={loadChallengeActions}
                      history={history} />
  )

  expect(wrapper.props().browsedChallenge).toEqual(challenge)
})

test("clustered task loading is kicked off for a new browsed challenge", async () => {
  const wrapper = shallow(
    <WrappedComponent match={match}
                      entities={basicState.entities}
                      loadChallenge={loadChallenge}
                      loadChallengeActions={loadChallengeActions}
                      history={history} />
  )

  expect(fetchTasks).toHaveBeenCalledWith(challenge.id, false)
})

test("virtual challenges get virtual=true when fetching tasks", async () => {
  challenge.isVirtual = true
  match.params = {virtualChallengeId: challenge.id}

  const wrapper = shallow(
    <WrappedComponent match={match}
                      entities={basicState.entities}
                      loadChallenge={loadChallenge}
                      loadChallengeActions={loadChallengeActions}
                      history={history}
                      virtualChallenge={challenge} />
  )

  expect(fetchTasks).toHaveBeenCalledWith(challenge.id, true)
})
