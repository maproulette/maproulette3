import React, { Component } from 'react'
import _each from 'lodash/each'
import { denormalize } from 'normalizr'
import { mapStateToProps,
         mapDispatchToProps,
         CHALLENGES_PREFERENCE_GROUP } from './WithChallengePreferences'
import { setPreferences } from '../../../services/Preferences/Preferences'

jest.mock('../../../services/Preferences/Preferences')

let challenge = null
let basicState = null

beforeEach(() => {
  challenge = {
    id: 123,
    minimize: true,
    collapseInstructions: true,
  }

  basicState = {
    currentPreferences: {
      challenges: {
        [challenge.id]: challenge,
      }
    },
  }
})

test("mapStateToProps maps minimizeChallenge to current minimize preference", () => {
  basicState.currentPreferences.challenges[challenge.id].minimize = false
  const mappedProps = mapStateToProps(basicState, {challengeId: challenge.id})

  expect(mappedProps.minimizeChallenge).toBe(false)
})

test("mapStateToProps maps collapseInstructions to current minimize preference", () => {
  basicState.currentPreferences.challenges[challenge.id].collapseInstructions = false
  const mappedProps = mapStateToProps(basicState, {challengeId: challenge.id})

  expect(mappedProps.collapseInstructions).toBe(false)
})

test("setChallengeMinimization updates the challenge's minimize preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setChallengeMinimization(challenge.id, true)
  expect(dispatch).toBeCalled()
  expect(setPreferences).toBeCalledWith(CHALLENGES_PREFERENCE_GROUP,
                                        {[challenge.id]: {minimize: true}})
})

test("setInstructionsCollapsed updates the challenge's collapseInstructions preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setInstructionsCollapsed(challenge.id, true)
  expect(dispatch).toBeCalled()
  expect(setPreferences).toBeCalledWith(CHALLENGES_PREFERENCE_GROUP,
                                        {[challenge.id]: {collapseInstructions: true}})
})
