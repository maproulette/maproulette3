import React from 'react'
import TaskFalsePositiveControl from './TaskFalsePositiveControl'
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
    quickKeyHandler: jest.fn((event, handler) => handler),
    intl: {formatMessage: jest.fn(m => m.defaultMessage)},
    activateKeyboardShortcut: jest.fn(),
    deactivateKeyboardShortcut: jest.fn(),
    textInputActive: jest.fn(event => false),
  }
})

test("shows false positive control", () => {
  const wrapper = shallow(
    <TaskFalsePositiveControl {...basicProps} />
  )

  expect(wrapper.find('.false-positive-control').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the false positive button signals task completion with falsePositive status", () => {
  const wrapper = shallow(
    <TaskFalsePositiveControl {...basicProps} />
  )

  wrapper.find('.false-positive-control').simulate('click')

  expect(basicProps.complete).toBeCalledWith(TaskStatus.falsePositive)
})

test("using the shortcut key signals task completion with falsePositive status", () => {
  const event = {
    target: {
      nodeName: "div"
    },
    key: keyMappings.taskCompletion.falsePositive.key,
  }

  const wrapper = shallow(
    <TaskFalsePositiveControl {...basicProps} />
  )

  wrapper.instance().handleKeyboardShortcuts(event)
  expect(basicProps.complete).toBeCalledWith(TaskStatus.falsePositive)
})
