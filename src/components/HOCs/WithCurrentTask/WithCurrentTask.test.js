import React, { Component } from 'react'
import _each from 'lodash/each'
import { denormalize } from 'normalizr'
import { mapStateToProps, mapDispatchToProps, visitNewTask } from './WithCurrentTask'
import { taskDenormalizationSchema,
         loadCompleteTask,
         loadRandomTaskFromChallenge,
         addTaskComment,
         completeTask } from '../../../services/Task/Task'
import { fetchChallengeActions } from '../../../services/Challenge/Challenge'

jest.mock('normalizr')
jest.mock('../../../services/Task/Task')
jest.mock('../../../services/Challenge/Challenge')

denormalize.mockImplementation((challenge, schema, entities) => challenge)

let basicState = null

beforeEach(() => {
  basicState = {
    entities: {
      tasks: {
        1: {
          taskId: 1,
          name: "task1",
          parent: {
            id: 123
          }
        }
      },
      challenges: [
        {
          id: 123,
          name: "challenge1",
          difficulty: "hard",
          actions: {available: 3},
          enabled: true,
        },
      ]
    },
    currentPreferences: {
      challenges: {
        123: {
          minimize: true,
          collapseInstructions: true,
        }
      }
    },
  }
})

test("mapStateToProps maps task from a given taskId", () => {
  const mappedProps = mapStateToProps(basicState, {taskId: 1})

  // { task: { taskId: 1, name: 'task1', parent: { id: 5 } },
  //       taskId: 1,
  //       minimizeChallenge: false,
  //       collapseInstructions: false }

  expect(mappedProps.task).toEqual(basicState.entities.tasks["1"])
  expect(denormalize).toHaveBeenCalled()

  expect(mappedProps).toMatchSnapshot()
})


test("mapStateToProps maps minimizeChallenge to current minimize preference", () => {
  basicState.currentPreferences.challenges["123"].minimize = false
  const mappedProps = mapStateToProps(basicState, {taskId: 1})

  expect(mappedProps.minimizeChallenge).toEqual(false)
})

test("mapStateToProps maps collapseInstructions to current minimize preference", () => {
  basicState.currentPreferences.challenges["123"].collapseInstructions = false
  const mappedProps = mapStateToProps(basicState, {taskId: 1})

  expect(mappedProps.collapseInstructions).toEqual(false)
})

test("mapDispatchToProps maps some functions", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  expect(mappedProps).toMatchSnapshot()
})

test("mapDispatchToProps loadTask calls loadCompleteTask", () => {
  const dispatch  = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  mappedProps.loadTask(1)
  expect(dispatch).toBeCalled()
  expect(loadCompleteTask).toBeCalledWith(1)
})

test("mapDispatchToProps completeTask calls completeTask", () => {
  const task = {id: 1}
  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  mappedProps.completeTask(1, 123, "good", "")
  expect(dispatch).toBeCalled()
  expect(completeTask).toBeCalledWith(1, 123, "good")
})

test("completeTask calls addComment if comment present",  async () => {
  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  await mappedProps.completeTask(1, 123, "good", "my new comment")
  expect(addTaskComment).toHaveBeenLastCalledWith(1, "my new comment", "good")
})

test("completeTask does not call addComment if no comment", async () => {
  addTaskComment.mockClear()

  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  await mappedProps.completeTask(1, 123, "good", "")
  expect(addTaskComment).not.toHaveBeenCalled()
})

test("completeTask calls loadRandomTaskFromChallenge", () => {
  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  mappedProps.completeTask(1, 123, "good", "my comment")
  expect(loadRandomTaskFromChallenge).toBeCalledWith(123, 1)
})

test("completeTask calls fetchChallengeActions", () => {
  const taskId = 1
  const challengeId = 123

  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  mappedProps.completeTask(taskId, challengeId, "good", "my comment")
  expect(fetchChallengeActions).toBeCalledWith(challengeId)
})

test("completeTask routes the user to the new task if there is one", async () => {
  const taskId = 1
  const challengeId = 123
  const nextTask = {id: 2}

  completeTask.mockReturnValueOnce(Promise.resolve())
  loadRandomTaskFromChallenge.mockReturnValueOnce(Promise.resolve(nextTask))
  const dispatch = jest.fn(value => value)
  const history = {
    push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  await mappedProps.completeTask(taskId, challengeId, "good", "my comment")
  expect(history.push).toBeCalledWith(`/challenge/${challengeId}/task/${nextTask.id}`)
})

test("completeTask routes the user home if the next task isn't new", async () => {
  const taskId = 1
  const challengeId = 123
  const nextTask = {id: taskId} // same as our current task

  completeTask.mockReturnValueOnce(Promise.resolve())
  loadRandomTaskFromChallenge.mockReturnValueOnce(Promise.resolve(nextTask))
  const dispatch = jest.fn(value => value)
  const history = {
    push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  await mappedProps.completeTask(taskId, challengeId, "good", "my comment")
  expect(history.push).toBeCalledWith('/')
})

test("completeTask routes the user home if there is no next task", async () => {
  const taskId = 1
  const challengeId = 123

  completeTask.mockReturnValueOnce(Promise.resolve())
  loadRandomTaskFromChallenge.mockReturnValueOnce(Promise.resolve(null))
  const dispatch = jest.fn(value => value)
  const history = {
    push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  await mappedProps.completeTask(taskId, challengeId, "good", "my comment")
  expect(history.push).toBeCalledWith('/')
})
