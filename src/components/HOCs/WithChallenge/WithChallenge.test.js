import React, { Component } from 'react'
import { mapDispatchToProps, getChallenge } from './WithChallenge'

jest.mock('../../../services/Challenge/Challenge')

let basicState = null

const fetchChallenge = jest.fn()

test("mapDispatchToProps makes the loadChallenge() function available", async () => {
  const challengeId = 123
  const normalizedResults = {result: challengeId, entities: {challenges: {123:{challengeId: 123}}}}
  const dispatch  = jest.fn(() => Promise.resolve(normalizedResults))
  const mappedProps = mapDispatchToProps(dispatch)

  const result = await mappedProps.loadChallenge(challengeId)
  expect(dispatch).toBeCalled()
  expect(result).toEqual({challengeId: challengeId})
})

test("getChallenge returns the Challenge from the entities map if it exists", () => {
  const challengeId = 123
  const props = {entities: {challenges: {123: {challengeId: 123}}}}

  const component = {state: {}, setState: jest.fn() }
  const result = getChallenge(challengeId, props, component)
  expect(component.setState).toBeCalledWith({"challenge": {"challengeId": 123}})
})

test("getChallenge returns a fetched Challenge if not already fetched", async () => {
  const challengeId = 123
  const normalizedResults = {result: challengeId, entities: {challenges: {123: {challengeId: 123}}}}
  const props = {
    loadChallenge: (challengeId) => Promise.resolve({challengeId: challengeId})
  }

  const component = {state: {}, setState: jest.fn() }
  const result = await getChallenge(challengeId, props, component)
  expect(component.setState).toBeCalledWith({"challenge": {"challengeId": 123}})
})
