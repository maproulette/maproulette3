import React from 'react'
import TaskSkipControl from './TaskSkipControl'
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
    quickKeyHandler: jest.fn((event, handler) => handler),
    complete: jest.fn(),
    intl: {formatMessage: jest.fn(m => m.defaultMessage)},
    activateKeyboardShortcut: jest.fn(),
    deactivateKeyboardShortcut: jest.fn(),
    textInputActive: jest.fn(e => false),
  }
})

test("shows skip control", () => {
  const wrapper = shallow(
    <TaskSkipControl {...basicProps} />
  )

  expect(wrapper.find('.skip-control').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the skip button signals task completion with skipped status", () => {
  const wrapper = shallow(
    <TaskSkipControl {...basicProps} />
  )

  wrapper.find('.skip-control').simulate('click')

  expect(basicProps.complete).toBeCalledWith(TaskStatus.skipped)
})

test("using the shortcut key signals task completion with skipped status", () => {
  const event = {
    target: {
      nodeName: "div"
    },
    key: keyMappings.taskCompletion.skip.key,
  }

  const wrapper = shallow(
    <TaskSkipControl {...basicProps} />
  )

  wrapper.instance().handleKeyboardShortcuts(event)
  expect(basicProps.complete).toBeCalledWith(TaskStatus.skipped)
})
