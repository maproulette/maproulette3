import React from 'react'
import TaskCancelEditingControl from './TaskCancelEditingControl'
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
    cancelEditing: jest.fn(),
    intl: {formatMessage: jest.fn(m => m.defaultMessage)},
    activateKeyboardShortcut: jest.fn(),
    deactivateKeyboardShortcut: jest.fn(),
    textInputActive: jest.fn(event => false),
  }
})

test("shows cancel control", () => {
  const wrapper = shallow(
    <TaskCancelEditingControl {...basicProps} />
  )

  expect(wrapper.find('.cancel-control').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the cancel button signals cancellation of editing", () => {
  const wrapper = shallow(
    <TaskCancelEditingControl {...basicProps} />
  )

  wrapper.find('.cancel-control').simulate('click')

  expect(basicProps.cancelEditing).toBeCalled()
})

test("using the shortcut key signals cancellation of editing", () => {
  const event = {
    target: {
      nodeName: "div"
    },
    key: keyMappings.taskEditing.cancel.key,
  }

  const wrapper = shallow(
    <TaskCancelEditingControl {...basicProps} />
  )

  wrapper.instance().handleKeyboardShortcuts(event)
  expect(basicProps.cancelEditing).toBeCalled()
})

test("shortcut key is ignored when typing in a text input", () => {
  const event = {
    target: {
      nodeName: "div"
    },
    key: keyMappings.taskEditing.cancel.key,
  }
  basicProps.textInputActive = jest.fn(e => true)

  const wrapper = shallow(
    <TaskCancelEditingControl {...basicProps} />
  )

  wrapper.instance().handleKeyboardShortcuts(event)
  expect(basicProps.cancelEditing).not.toBeCalled()
})
