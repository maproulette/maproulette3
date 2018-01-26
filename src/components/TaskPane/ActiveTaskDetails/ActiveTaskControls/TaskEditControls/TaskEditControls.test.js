import React from 'react'
import TaskEditControls from './TaskEditControls'
import keyMappings from '../../../../../KeyMappings'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'

let basicProps = null

beforeEach(() => {
  basicProps = {
    task: {
      id: 123,
      parent: {
        id: 321,
      }
    },
    comment: "Foo",
    mapBounds: {
      task: {
        bounds: [0, 0, 0, 0],
      }
    },
    keyboardShortcutGroups: keyMappings,
    user: {
      id: 357,
      settings: {defaultEditor: 1},
      isLoggedIn: true,
    },
    editTask: jest.fn(),
    completeTask: jest.fn(),
    saveTask: jest.fn(),
    unsaveTask: jest.fn(),
    setComment: jest.fn(),
    setTaskBeingCompleted: jest.fn(),
    activateKeyboardShortcuts: jest.fn(),
    deactivateKeyboardShortcuts: jest.fn(),
    intl: {formatMessage: jest.fn()},
  }
})

test("shows only a sign-in button if the user is not logged in", () => {
  basicProps.user.isLoggedIn = false

  const wrapper = shallow(
    <TaskEditControls {...basicProps} />
  )

  expect(wrapper.find('.task-edit-controls--signin').exists()).toBe(true)
  expect(wrapper.find('.task-edit-controls__edit-control').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("shows edit controls if user is logged in", () => {
  const wrapper = shallow(
    <TaskEditControls {...basicProps} />
  )

  expect(wrapper.find('.task-edit-controls__edit-control').exists()).toBe(true)
  expect(wrapper.find('.task-edit-controls--signin').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("shows an edit button for the user's configured editor", () => {
  const wrapper = shallow(
    <TaskEditControls {...basicProps} />
  )

  expect(wrapper.find('.task-edit-controls__edit-control').exists()).toBe(true)
  expect(wrapper.find('.task-edit-controls__editor-dropdown').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the edit button signals opening of the editor", () => {
  const wrapper = shallow(
    <TaskEditControls {...basicProps} />
  )

  wrapper.find('.task-edit-controls__edit-control').simulate('click')

  expect(basicProps.editTask).toBeCalled()
  expect(
    basicProps.editTask.mock.calls[0][0]
  ).toBe(basicProps.user.settings.defaultEditor)
})

test("clicking the edit button signals that task completion has begun", () => {
  const wrapper = shallow(
    <TaskEditControls {...basicProps} />
  )

  wrapper.find('.task-edit-controls__edit-control').simulate('click')

  expect(basicProps.setTaskBeingCompleted).toBeCalledWith(basicProps.task.id)
})

test("presents a completion comment field", () => {
  const wrapper = shallow(
    <TaskEditControls {...basicProps} />
  )

  expect(wrapper.find(
    `TaskCommentInput[value="${basicProps.comment}"]`
  ).exists()).toBe(true)
})

test("shows a dropdown of editor choices if user has not configured an editor", () => {
  basicProps.user.settings = {}

  const wrapper = shallow(
    <TaskEditControls {...basicProps} />
  )

  expect(wrapper.find('.task-edit-controls__editor-dropdown').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the false positive button signals task completion with correct status", () => {
  const wrapper = shallow(
    <TaskEditControls {...basicProps} />
  )

  wrapper.find('.task-edit-controls__false-positive-control').simulate('click')

  expect(basicProps.completeTask).toBeCalledWith(basicProps.task.id,
                                                 basicProps.task.parent.id,
                                                 TaskStatus.falsePositive,
                                                 basicProps.comment)

  expect(basicProps.setTaskBeingCompleted).toBeCalledWith(basicProps.task.id)
})

test("clicking the skip button signals task completion with correct status", () => {
  const wrapper = shallow(
    <TaskEditControls {...basicProps} />
  )

  wrapper.find('.task-edit-controls__skip-control').simulate('click')


  expect(basicProps.completeTask).toBeCalledWith(basicProps.task.id,
                                                 basicProps.task.parent.id,
                                                 TaskStatus.skipped,
                                                 basicProps.comment)

  expect(basicProps.setTaskBeingCompleted).toBeCalledWith(basicProps.task.id)
})
