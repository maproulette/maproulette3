import React from 'react'
import TaskEditControl from './TaskEditControl'
import { Editor } from '../../../../../services/Editor/Editor'
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
    user: {
      id: 357,
      settings: {defaultEditor: 1},
      isLoggedIn: true,
    },
    keyboardShortcutGroups: keyMappings,
    pickEditor: jest.fn(),
    intl: {formatMessage: jest.fn(m => m.defaultMessage)},
    activateKeyboardShortcutGroup: jest.fn(),
    deactivateKeyboardShortcutGroup: jest.fn(),
    textInputActive: jest.fn(event => false),
  }
})

test("shows edit control", () => {
  const wrapper = shallow(
    <TaskEditControl {...basicProps} />
  )

  expect(wrapper.find('.edit-control').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("shows an edit button for the user's configured editor", () => {
  const wrapper = shallow(
    <TaskEditControl {...basicProps} />
  )

  expect(wrapper.find('.edit-control').exists()).toBe(true)
  expect(wrapper.find('.editor-dropdown').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the edit button signals choosing of the editor", () => {
  const wrapper = shallow(
    <TaskEditControl {...basicProps} />
  )

  wrapper.find('.edit-control').simulate('click')

  expect(basicProps.pickEditor).toBeCalled()
  expect(
    basicProps.pickEditor.mock.calls[0][0].value
  ).toBe(basicProps.user.settings.defaultEditor)
})

test("shows a dropdown of editor choices if user has not configured an editor", () => {
  basicProps.user.settings = {}

  const wrapper = shallow(
    <TaskEditControl {...basicProps} />
  )

  expect(wrapper.find('.editor-dropdown').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("using the shortcut key for iD signals choosing of the Id editor", () => {
  const event = {
    target: {
      nodeName: "div"
    },
    key: keyMappings.openEditor.editId.key,
  }

  const wrapper = shallow(
    <TaskEditControl {...basicProps} />
  )

  wrapper.instance().handleKeyboardShortcuts(event)

  expect(basicProps.pickEditor).toBeCalled()
  expect(
    basicProps.pickEditor.mock.calls[0][0].value
  ).toBe(Editor.id)
})

test("using the shortcut key for JOSM signals choosing of the JOSM editor", () => {
  const event = {
    target: {
      nodeName: "div"
    },
    key: keyMappings.openEditor.editJosm.key,
  }

  const wrapper = shallow(
    <TaskEditControl {...basicProps} />
  )

  wrapper.instance().handleKeyboardShortcuts(event)

  expect(basicProps.pickEditor).toBeCalled()
  expect(
    basicProps.pickEditor.mock.calls[0][0].value
  ).toBe(Editor.josm)
})

test("using the shortcut key for JOSM layer signals choosing of the JOSM editor with a layer", () => {
  const event = {
    target: {
      nodeName: "div"
    },
    key: keyMappings.openEditor.editJosmLayer.key,
  }

  const wrapper = shallow(
    <TaskEditControl {...basicProps} />
  )

  wrapper.instance().handleKeyboardShortcuts(event)

  expect(basicProps.pickEditor).toBeCalled()
  expect(
    basicProps.pickEditor.mock.calls[0][0].value
  ).toBe(Editor.josmLayer)
})

test("iD shortcut key is ignored when typing in a text input", () => {
  const event = {
    target: {
      nodeName: "div"
    },
    key: keyMappings.openEditor.editId.key,
  }
  basicProps.textInputActive = jest.fn(e => true)

  const wrapper = shallow(
    <TaskEditControl {...basicProps} />
  )

  wrapper.instance().handleKeyboardShortcuts(event)
  expect(basicProps.pickEditor).not.toBeCalled()
})

test("josm shortcut key is ignored when typing in a text input", () => {
  const event = {
    target: {
      nodeName: "div"
    },
    key: keyMappings.openEditor.editJosmLayer.key,
  }
  basicProps.textInputActive = jest.fn(e => true)

  const wrapper = shallow(
    <TaskEditControl {...basicProps} />
  )

  wrapper.instance().handleKeyboardShortcuts(event)
  expect(basicProps.pickEditor).not.toBeCalled()
})
