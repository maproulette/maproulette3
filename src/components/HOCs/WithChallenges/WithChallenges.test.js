import React, { Component } from 'react'
import _each from 'lodash/each'
import { mapStateToProps, mapDispatchToProps } from './WithChallenges'
import { denormalize } from 'normalizr'
import { isUsableChallengeStatus }
       from '../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import { loadRandomTaskFromChallenge } from '../../../services/Task/Task'

jest.mock('normalizr')
jest.mock('../../../services/Challenge/ChallengeStatus/ChallengeStatus')
jest.mock('../../../services/Task/Task')

denormalize.mockImplementation((challenge, schema, entities) => challenge)

let basicState = null

beforeEach(() => {
  isUsableChallengeStatus.mockReturnValue(true)

  basicState = {
    entities: {
      challenges: [
        {
          id: 123,
          name: "challenge1",
          difficulty: "hard",
          actions: {available: 3},
          enabled: true,
        },
        {
          id: 456,
          name: "challenge2",
          difficulty: "easy",
          actions: {available: 6},
          enabled: true,
        },
        {
          id: 789,
          name: "challenge2",
          difficulty: "easy",
          actions: {available: 1},
          enabled: true,
        },
      ]
    }
  }
})

test("mapStateToProps maps all entities.challenges when allStatuses prop is true", () => {
  const mappedProps = mapStateToProps(basicState, {allStatuses: true})

  expect(isUsableChallengeStatus).not.toHaveBeenCalled()
  expect(mappedProps.challenges).toEqual(basicState.entities.challenges)

  expect(mappedProps).toMatchSnapshot()
})

test("only challenges with available tasks/actions are normally passed through", () => {
  basicState.entities.challenges[0].actions.available = 0
  const mappedProps = mapStateToProps(basicState, {})

  expect(
    mappedProps.challenges.length
  ).toBe(basicState.entities.challenges.length - 1)

  expect(mappedProps).toMatchSnapshot()
})

test("only enabled challenges are normally passed through", () => {
  basicState.entities.challenges[0].enabled = false
  const mappedProps = mapStateToProps(basicState, {})

  expect(
    mappedProps.challenges.length
  ).toBe(basicState.entities.challenges.length - 1)

  expect(mappedProps).toMatchSnapshot()
})

test("only enabled challenges are normally passed through", () => {
  basicState.entities.challenges[0].enabled = false
  const mappedProps = mapStateToProps(basicState, {})

  expect(
    mappedProps.challenges.length
  ).toBe(basicState.entities.challenges.length - 1)

  expect(mappedProps).toMatchSnapshot()
})

test("only challenges with a usable status are normally passed through", () => {
  isUsableChallengeStatus.mockReturnValueOnce(false)
  const mappedProps = mapStateToProps(basicState, {})

  expect(
    mappedProps.challenges.length
  ).toBe(basicState.entities.challenges.length - 1)

  expect(mappedProps).toMatchSnapshot()
})

test("challenges are denormalized before being passed through", () => {
  const mappedProps = mapStateToProps(basicState, {})

  expect(denormalize).toHaveBeenCalled()

  expect(
    mappedProps.challenges.length
  ).toBe(basicState.entities.challenges.length)

  expect(mappedProps).toMatchSnapshot()
})
