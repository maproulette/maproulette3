import React, { Component } from 'react'
import { denormalize } from 'normalizr'
import { mapStateToProps,
         mapDispatchToProps,
         visitNewTask } from './WithCurrentTask'
import { taskDenormalizationSchema,
         loadRandomTaskFromChallenge,
         loadRandomTaskFromVirtualChallenge,
         addTaskComment,
         completeTask } from '../../../services/Task/Task'
import { TaskLoadMethod }
       from '../../../services/Task/TaskLoadMethod/TaskLoadMethod'
import { fetchChallengeActions } from '../../../services/Challenge/Challenge'

jest.mock('normalizr')
jest.mock('../../../services/Task/Task')
jest.mock('../../../services/Challenge/Challenge')

denormalize.mockImplementation((challenge, schema, entities) => challenge)

let task = null
let challenge = null
let virtualChallenge = null
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

  virtualChallenge = {
    id: 246,
    name: "virtualChallenge246",
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

  loadRandomTaskFromChallenge.mockClear()
  loadRandomTaskFromVirtualChallenge.mockClear()
  jest.useFakeTimers()
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

test("mapDispatchToProps completeTask calls completeTask", () => {
  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  mappedProps.completeTask(task, challenge.id, completionStatus)
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

  await mappedProps.completeTask(task, challenge.id, completionStatus, comment)
  expect(addTaskComment).toHaveBeenLastCalledWith(task, comment, completionStatus)
})

test("completeTask does not call addComment if no comment", async () => {
  addTaskComment.mockClear()

  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  await mappedProps.completeTask(task, challenge.id, completionStatus)
  expect(addTaskComment).not.toHaveBeenCalled()
})

test("completeTask calls loadRandomTaskFromChallenge without proximate task by default",  async () => {
  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history, challengeId: challenge.id})

  await mappedProps.completeTask(task, challenge.id, completionStatus)
  expect(loadRandomTaskFromChallenge).toBeCalledWith(challenge.id, undefined)
})

test("completeTask calls loadRandomTaskFromChallenge with task if proximate load method", async () => {
  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history, challengeId: challenge.id})

  await mappedProps.completeTask(task, challenge.id,
                           completionStatus, "", TaskLoadMethod.proximity)
  expect(loadRandomTaskFromChallenge).toBeCalledWith(challenge.id, task.id)
})

test("completeTask calls fetchChallengeActions", () => {
  const dispatch  = jest.fn(() => Promise.resolve())
  const history = {
   push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})
  mappedProps.completeTask(task, challenge.id, completionStatus)
  jest.runOnlyPendingTimers()

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

  const mappedProps = mapDispatchToProps(dispatch, {history, challengeId: challenge.id})

  await mappedProps.completeTask(task, challenge.id, completionStatus)
  expect(history.push).toBeCalledWith(`/challenge/${challenge.id}/task/${nextTask.id}`)
})

test("completeTask routes the user to the new task in a virtual challenge", async () => {
  const nextTask = {id: 654}

  completeTask.mockReturnValueOnce(Promise.resolve())
  loadRandomTaskFromVirtualChallenge.mockReturnValueOnce(Promise.resolve(nextTask))
  const dispatch = jest.fn(value => value)
  const history = {
    push: jest.fn(),
  }

  const mappedProps =
    mapDispatchToProps(dispatch, {history, virtualChallengeId: virtualChallenge.id})

  await mappedProps.completeTask(task, challenge.id, completionStatus)
  expect(history.push).toBeCalledWith(`/virtual/${virtualChallenge.id}/task/${nextTask.id}`)
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

  await mappedProps.completeTask(task, challenge.id, completionStatus)
  expect(history.push).toBeCalledWith('/browse/challenges', {congratulate: true})
})

test("completeTask routes the user home if there is no next task", async () => {
  completeTask.mockReturnValueOnce(Promise.resolve())
  loadRandomTaskFromChallenge.mockReturnValueOnce(Promise.resolve(null))
  const dispatch = jest.fn(value => value)
  const history = {
    push: jest.fn(),
  }

  const mappedProps = mapDispatchToProps(dispatch, {history})

  await mappedProps.completeTask(task, challenge.id, completionStatus)
  expect(history.push).toBeCalledWith('/browse/challenges', {congratulate: true})
})
