import React from 'react'
import { omit as _omit, cloneDeep as _cloneDeep } from 'lodash'
import TaskEditControls from './TaskEditControls'
import keyMappings from '../../../../../KeyMappings'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'

const propsFixture = {
  task: {
    id: 123,
    parent: {
      id: 321,
    }
  },
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
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)

  basicProps.editTask = jest.fn()
  basicProps.completeTask = jest.fn()
  basicProps.setTaskBeingCompleted = jest.fn()
  basicProps.activateKeyboardShortcuts = jest.fn()
  basicProps.deactivateKeyboardShortcuts = jest.fn()
  basicProps.intl = {formatMessage: jest.fn()}
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

  expect(basicProps.editTask.mock.calls.length).toBe(1)
  expect(basicProps.editTask.mock.calls[0][0]).toBe(basicProps.user.settings.defaultEditor)
})

test("clicking the edit button signals that task completion has begun", () => {
  const wrapper = shallow(
    <TaskEditControls {...basicProps} />
  )

  wrapper.find('.task-edit-controls__edit-control').simulate('click')

  expect(basicProps.setTaskBeingCompleted.mock.calls.length).toBe(1)
  expect(basicProps.setTaskBeingCompleted.mock.calls[0][0]).toBe(basicProps.task.id)
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

  expect(basicProps.completeTask.mock.calls.length).toBe(1)
  expect(basicProps.completeTask.mock.calls[0][0]).toBe(basicProps.task.id)
  expect(basicProps.completeTask.mock.calls[0][1]).toBe(basicProps.task.parent.id)
  expect(basicProps.completeTask.mock.calls[0][2]).toBe(TaskStatus.falsePositive)

  expect(basicProps.setTaskBeingCompleted.mock.calls.length).toBe(1)
  expect(basicProps.setTaskBeingCompleted.mock.calls[0][0]).toBe(basicProps.task.id)
})

test("clicking the skip button signals task completion with correct status", () => {
  const wrapper = shallow(
    <TaskEditControls {...basicProps} />
  )

  wrapper.find('.task-edit-controls__skip-control').simulate('click')

  expect(basicProps.completeTask.mock.calls.length).toBe(1)
  expect(basicProps.completeTask.mock.calls[0][0]).toBe(basicProps.task.id)
  expect(basicProps.completeTask.mock.calls[0][1]).toBe(basicProps.task.parent.id)
  expect(basicProps.completeTask.mock.calls[0][2]).toBe(TaskStatus.skipped)

  expect(basicProps.setTaskBeingCompleted.mock.calls.length).toBe(1)
  expect(basicProps.setTaskBeingCompleted.mock.calls[0][0]).toBe(basicProps.task.id)
})
