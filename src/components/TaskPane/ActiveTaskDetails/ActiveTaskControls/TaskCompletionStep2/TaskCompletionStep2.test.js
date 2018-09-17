import React from 'react'
import TaskCompletionStep2 from './TaskCompletionStep2'
import keyMappings from '../../../../../services/KeyboardShortcuts/KeyMappings'
import { TaskStatus,
         allowedStatusProgressions } from '../../../../../services/Task/TaskStatus/TaskStatus'

let basicProps = null

beforeEach(() => {
  basicProps = {
    task: {
      id: 123,
      parent: {
        id: 321,
      },
      status: TaskStatus.created,
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
    cancelEditing: jest.fn(),
    complete: jest.fn(),
    intl: {formatMessage: jest.fn(m => m.defaultMessage)},
    activateKeyboardShortcutGroup: jest.fn(),
    deactivateKeyboardShortcutGroup: jest.fn(),
    activateKeyboardShortcut: jest.fn(),
    deactivateKeyboardShortcut: jest.fn(),
  }

  basicProps.allowedProgressions =
    allowedStatusProgressions(basicProps.task.status)
})

test("shows fixed control for appropriate status", () => {
  const wrapper = shallow(
    <TaskCompletionStep2 {...basicProps} />
  )

  expect(wrapper.find('TaskFixedControl').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't show fixed control if status not appropriate", () => {
  basicProps.task.status = TaskStatus.fixed
  basicProps.allowedProgressions =
    allowedStatusProgressions(basicProps.task.status)

  const wrapper = shallow(
    <TaskCompletionStep2 {...basicProps} />
  )

  expect(wrapper.find('TaskFixedControl').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("shows too-hard control for appropriate status", () => {
  const wrapper = shallow(
    <TaskCompletionStep2 {...basicProps} />
  )

  expect(wrapper.find('TaskTooHardControl').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't show too-hard control if status not appropriate", () => {
  basicProps.task.status = TaskStatus.fixed
  basicProps.allowedProgressions =
    allowedStatusProgressions(basicProps.task.status)

  const wrapper = shallow(
    <TaskCompletionStep2 {...basicProps} />
  )

  expect(wrapper.find('TaskTooHardControl').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("shows already-fixed control for appropriate status", () => {
  const wrapper = shallow(
    <TaskCompletionStep2 {...basicProps} />
  )

  expect(wrapper.find('TaskAlreadyFixedControl').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't show the already-fixed control if status not appropriate", () => {
  basicProps.task.status = TaskStatus.fixed
  basicProps.allowedProgressions =
    allowedStatusProgressions(basicProps.task.status)

  const wrapper = shallow(
    <TaskCompletionStep2 {...basicProps} />
  )

  expect(wrapper.find('TaskAlreadyFixedControl').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("shows cancel editing control", () => {
  const wrapper = shallow(
    <TaskCompletionStep2 {...basicProps} />
  )

  expect(wrapper.find('TaskCancelEditingControl').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("shows skip control for appropriate status", () => {
  const wrapper = shallow(
    <TaskCompletionStep2 {...basicProps} />
  )

  expect(wrapper.find('TaskSkipControl').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't show the skip control if status not appropriate", () => {
  basicProps.task.status = TaskStatus.fixed
  basicProps.allowedProgressions =
    allowedStatusProgressions(basicProps.task.status)

  const wrapper = shallow(
    <TaskCompletionStep2 {...basicProps} />
  )

  expect(wrapper.find('TaskSkipControl').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})
