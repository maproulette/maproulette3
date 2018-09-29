import React from 'react'
import TaskTooHardControl from './TaskTooHardControl'
import keyMappings from '../../../../../services/KeyboardShortcuts/KeyMappings'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'

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
    keyboardShortcutGroups: keyMappings,
    complete: jest.fn(),
    quickKeyHandler: jest.fn(),
    intl: {formatMessage: jest.fn(m => m.defaultMessage)},
    activateKeyboardShortcut: jest.fn(),
    deactivateKeyboardShortcut: jest.fn(),
    textInputActive: jest.fn(e => false),
  }
})

test("shows too-hard control", () => {
  const wrapper = shallow(
    <TaskTooHardControl {...basicProps} />
  )

  expect(wrapper.find('.too-hard-control').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the too-hard button signals task completion with tooHard status", () => {
  const wrapper = shallow(
    <TaskTooHardControl {...basicProps} />
  )

  wrapper.find('.too-hard-control').simulate('click')

  expect(basicProps.complete).toBeCalledWith(TaskStatus.tooHard)
})
