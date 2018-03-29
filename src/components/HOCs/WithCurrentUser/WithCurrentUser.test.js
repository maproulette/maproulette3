import React, { Component } from 'react'
import { mapStateToProps, mapDispatchToProps } from './WithCurrentUser'
import AsEndUser from '../../../interactions/User/AsEndUser'
import { denormalize } from 'normalizr'
import { logoutUser,
         saveChallenge, unsaveChallenge,
         saveTask, unsaveTask,
         userDenormalizationSchema } from '../../../services/User/User'

jest.mock('normalizr')
jest.mock('../../../services/User/User')
jest.mock('../../../interactions/User/AsEndUser')

const schema = {foo: "bar"}
let basicState = null

denormalize.mockImplementation((user, schema, entities) => user)
userDenormalizationSchema.mockImplementation(() => schema)

const isLoggedIn = jest.fn()
const isSuperUser = jest.fn()
AsEndUser.mockImplementation(() => ({
  isLoggedIn,
  isSuperUser,
}))


beforeEach(() => {
  AsEndUser.mockClear()

  basicState = {
    currentUser: {
      userId: 456,
    },
    entities: {
      users: {
        123: {
          id: 123,
        },
        456: {
          id: 456,
        },
      }
    }
  }
})

test("mapStateToProps provides the current user in denormalized form", () => {
  const mappedProps = mapStateToProps(basicState)

  expect(denormalize).toBeCalledWith(basicState.entities.users[basicState.currentUser.userId],
                                     schema, basicState.entities)
  expect(mappedProps.user.id).toBe(basicState.currentUser.userId)

  expect(mappedProps).toMatchSnapshot()
})

test("mapStateToProps adds isLoggedIn and isSuperUser fields to the user", () => {
  isLoggedIn.mockReturnValueOnce(true)
  isSuperUser.mockReturnValueOnce(true)

  const mappedProps = mapStateToProps(basicState)

  expect(isLoggedIn).toHaveBeenCalled()
  expect(mappedProps.user.isLoggedIn).toBe(true)

  expect(isSuperUser).toHaveBeenCalled()
  expect(mappedProps.user.isSuperUser).toBe(true)

  expect(mappedProps).toMatchSnapshot()
})

test("maps the user to null if there is no current user", () => {
  basicState.currentUser = null

  const mappedProps = mapStateToProps(basicState)
  expect(mappedProps.user).toBe(null)
})

test("mapDispatchToProps makes the logoutUser() function available", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.logoutUser()
  expect(dispatch).toBeCalled()
  expect(logoutUser).toBeCalled()
})

test("mapDispatchToProps makes the saveChallenge() function available", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch)

  const userId = 123
  const challengeId = 987

  mappedProps.saveChallenge(userId, challengeId)
  expect(dispatch).toBeCalled()
  expect(saveChallenge).toBeCalledWith(userId, challengeId)
})

test("mapDispatchToProps makes the unsaveChallenge() function available", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch)

  const userId = 123
  const challengeId = 987

  mappedProps.unsaveChallenge(userId, challengeId)
  expect(dispatch).toBeCalled()
  expect(unsaveChallenge).toBeCalledWith(userId, challengeId)
})

test("mapDispatchToProps makes the saveTask() function available", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch)

  const userId = 123
  const taskId = 987

  mappedProps.saveTask(userId, taskId)
  expect(dispatch).toBeCalled()
  expect(saveTask).toBeCalledWith(userId, taskId)
})

test("mapDispatchToProps makes the unsaveTask() function available", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch)

  const userId = 123
  const taskId = 987

  mappedProps.unsaveTask(userId, taskId)
  expect(dispatch).toBeCalled()
  expect(unsaveTask).toBeCalledWith(userId, taskId)
})
