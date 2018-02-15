import React from 'react'
import TaskCompletionStep1 from './TaskCompletionStep1'
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
    user: {
      id: 357,
      settings: {defaultEditor: 1},
      isLoggedIn: true,
    },
    keyboardShortcutGroups: keyMappings,
    pickEditor: jest.fn(),
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

test("shows edit control for appropriate status", () => {
  const wrapper = shallow(
    <TaskCompletionStep1 {...basicProps} />
  )

  expect(wrapper.find('TaskEditControl').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't show edit control if status not appropriate", () => {
  basicProps.task.status = TaskStatus.fixed
  basicProps.allowedProgressions =
    allowedStatusProgressions(basicProps.task.status)

  const wrapper = shallow(
    <TaskCompletionStep1 {...basicProps} />
  )

  expect(wrapper.find('TaskEditControl').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("shows false positive control for appropriate status", () => {
  const wrapper = shallow(
    <TaskCompletionStep1 {...basicProps} />
  )

  expect(wrapper.find('TaskFalsePositiveControl').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't show false positive control if status not appropriate", () => {
  basicProps.task.status = TaskStatus.fixed
  basicProps.allowedProgressions =
    allowedStatusProgressions(basicProps.task.status)

  const wrapper = shallow(
    <TaskCompletionStep1 {...basicProps} />
  )

  expect(wrapper.find('TaskFalsePositiveControl').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("shows skip control for appropriate status", () => {
  const wrapper = shallow(
    <TaskCompletionStep1 {...basicProps} />
  )

  expect(wrapper.find('TaskSkipControl').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't show the skip control if status not appropriate", () => {
  basicProps.task.status = TaskStatus.fixed
  basicProps.allowedProgressions =
    allowedStatusProgressions(basicProps.task.status)

  const wrapper = shallow(
    <TaskCompletionStep1 {...basicProps} />
  )

  expect(wrapper.find('TaskSkipControl').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})
