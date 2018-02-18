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

let task = null
let challenge = null
let completionStatus = null
let basicState = null

beforeEach(() => {
  challenge = {
    id: 123,
    name: "challenge123",
    difficulty: "hard",
    actions: {available: 3},
    enabled: true,
  }

  task = {
    id: 987,
    name: "task987",
    parent: challenge.id,
  }

  completionStatus = 1

  basicState = {
    entities: {
      tasks: {
        [task.id]: task,
      },
      challenges: {
        [challenge.id] : challenge,
      },
    },
  }
})

test("mapStateToProps maps task from the taskId in the route", () => {
  const routeMatchProps = {
    match: {
      params: {taskId: task.id}
    }
  }

  const mappedProps = mapStateToProps(basicState, routeMatchProps)
  expect(mappedProps.task.id).toEqual(task.id)
  expect(denormalize).toHaveBeenCalled()

  expect(mappedProps).toMatchSnapshot()
})

test("mapDispatchToProps maps some functions", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  expect(mappedProps).toMatchSnapshot()
})

test("mapDispatchToProps loadTask calls loadCompleteTask", () => {
  const dispatch  = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  mappedProps.loadTask(task.id)
  expect(dispatch).toBeCalled()
  expect(loadCompleteTask).toBeCalledWith(task.id)
})

test("mapDispatchToProps completeTask calls completeTask", () => {
  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  mappedProps.completeTask(task.id, challenge.id, completionStatus)
  expect(dispatch).toBeCalled()
  expect(completeTask).toBeCalledWith(task.id, challenge.id, completionStatus)
})

test("completeTask calls addComment if comment present",  async () => {
  const comment = "A Comment"
  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  await mappedProps.completeTask(task.id, challenge.id, completionStatus, comment)
  expect(addTaskComment).toHaveBeenLastCalledWith(task.id, comment, completionStatus)
})

test("completeTask does not call addComment if no comment", async () => {
  addTaskComment.mockClear()

  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  await mappedProps.completeTask(task.id, challenge.id, completionStatus)
  expect(addTaskComment).not.toHaveBeenCalled()
})

test("completeTask calls loadRandomTaskFromChallenge", () => {
  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  mappedProps.completeTask(task.id, challenge.id, completionStatus)
  expect(loadRandomTaskFromChallenge).toBeCalledWith(challenge.id, task.id)
})

test("completeTask calls fetchChallengeActions", () => {
  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  mappedProps.completeTask(task.id, challenge.id, completionStatus)
  expect(fetchChallengeActions).toBeCalledWith(challenge.id)
})

test("completeTask routes the user to the new task if there is one", async () => {
  const nextTask = {id: 654}

  completeTask.mockReturnValueOnce(Promise.resolve())
  loadRandomTaskFromChallenge.mockReturnValueOnce(Promise.resolve(nextTask))
  const dispatch = jest.fn(value => value)
  const history = {
    push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  await mappedProps.completeTask(task.id, challenge.id, completionStatus)
  expect(history.push).toBeCalledWith(`/challenge/${challenge.id}/task/${nextTask.id}`)
})

test("completeTask routes the user home if the next task isn't new", async () => {
  const nextTask = {id: task.id} // same as our current task

  completeTask.mockReturnValueOnce(Promise.resolve())
  loadRandomTaskFromChallenge.mockReturnValueOnce(Promise.resolve(nextTask))
  const dispatch = jest.fn(value => value)
  const history = {
    push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  await mappedProps.completeTask(task.id, challenge.id, completionStatus)
  expect(history.push).toBeCalledWith('/')
})

test("completeTask routes the user home if there is no next task", async () => {
  completeTask.mockReturnValueOnce(Promise.resolve())
  loadRandomTaskFromChallenge.mockReturnValueOnce(Promise.resolve(null))
  const dispatch = jest.fn(value => value)
  const history = {
    push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  await mappedProps.completeTask(task.id, challenge.id, completionStatus)
  expect(history.push).toBeCalledWith('/')
})
