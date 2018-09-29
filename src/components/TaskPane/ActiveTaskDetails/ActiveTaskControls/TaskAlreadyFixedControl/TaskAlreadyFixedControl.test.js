import React from 'react'
import TaskAlreadyFixedControl from './TaskAlreadyFixedControl'
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
    complete: jest.fn(),
    quickKeyHandler: jest.fn((event, handler) => handler),
    intl: {formatMessage: jest.fn(m => m.defaultMessage)},
    keyboardShortcutGroups: keyMappings,
    activateKeyboardShortcut: jest.fn(),
    deactivateKeyboardShortcut: jest.fn(),
    textInputActive: jest.fn(e => false),
  }
})

test("shows already-fixed control", () => {
  const wrapper = shallow(
    <TaskAlreadyFixedControl {...basicProps} />
  )

  expect(wrapper.find('.already-fixed-control').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the already-fixed button signals task completion with alreadyFixed status", () => {
  const wrapper = shallow(
    <TaskAlreadyFixedControl {...basicProps} />
  )

  wrapper.find('.already-fixed-control').simulate('click')

  expect(basicProps.complete).toBeCalledWith(TaskStatus.alreadyFixed)
})
