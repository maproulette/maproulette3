import React from 'react'
import _omit from 'lodash/omit'
import { ActiveTaskControls } from './ActiveTaskControls'
import keyMappings from '../../../../services/KeyboardShortcuts/KeyMappings'
import { Editor } from '../../../../services/Editor/Editor'
import { TaskStatus } from '../../../../services/Task/TaskStatus/TaskStatus'

let challengeId = null
let taskId = null
let task = null
let basicProps = null

beforeEach(() => {
  challengeId = 321
  taskId = 123

  task = {
    id: taskId,
    parent: {
      id: challengeId,
    },
    status: TaskStatus.created,
  }

  basicProps = {
    task,
    challengeId,
    editor: {
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
    taskLoadBy: 'random',
    setTaskLoadBy: jest.fn(),
    activateKeyboardShortcutGroup: jest.fn(),
    deactivateKeyboardShortcutGroup: jest.fn(),
    editTask: jest.fn(),
    completeTask: jest.fn(),
    nextTask: jest.fn(),
    saveTask: jest.fn(),
    unsaveTask: jest.fn(),
    setTaskBeingCompleted: jest.fn(),
    closeEditor: jest.fn(),
    intl: {formatMessage: jest.fn()},
  }
})

test("shows only a sign-in button if the user is not logged in", () => {
  basicProps.user.isLoggedIn = false

  const wrapper = shallow(
    <ActiveTaskControls {...basicProps} />
  )

  expect(wrapper.find('.active-task-controls--signin').exists()).toBe(true)
  expect(wrapper.find('TaskCommentInput').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("a next-task control is not shown if the task is not in a completed status.", () => {
  const wrapper = shallow(
    <ActiveTaskControls {...basicProps} />
  )

  expect(wrapper.find('TaskNextControl').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("shows a completion comment field", () => {
  const wrapper = shallow(
    <ActiveTaskControls {...basicProps} />
  )

  expect(wrapper.find('TaskCommentInput').exists()).toBe(true)
})

test("shows a comment field even for tasks that cannot progress further", () => {
  basicProps.task.status = TaskStatus.fixed

  const wrapper = shallow(
    <ActiveTaskControls {...basicProps} />
  )

  expect(wrapper.find('TaskCommentInput').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("the comment field contains the current comment", () => {
  const wrapper = shallow(
    <ActiveTaskControls {...basicProps} />
  )

  wrapper.instance().setComment("Foo")
  wrapper.update()

  expect(wrapper.find('TaskCommentInput[value="Foo"]').exists()).toBe(true)
})

test("shows completion controls if the user has begun editing the task", () => {
  basicProps.editor.taskId = taskId
  basicProps.editor.success = true

  const wrapper = shallow(
    <ActiveTaskControls {...basicProps} />
  )

  expect(wrapper.find('TaskCompletionStep2').exists()).toBe(true)
  expect(wrapper.find('TaskCompletionStep1').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("shows edit controls if the user has not yet begun editing the task", () => {
  const wrapper = shallow(
    <ActiveTaskControls {...basicProps} />
  )

  expect(wrapper.find('TaskCompletionStep1').exists()).toBe(true)
  expect(wrapper.find('TaskCompletionStep2').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("a busy spinner is shown when switching from edit controls to completion controls", () => {
  basicProps.task.status = TaskStatus.created

  const wrapper = shallow(
    <ActiveTaskControls {...basicProps} />
  )

  wrapper.instance().pickEditor({value: Editor.JOSM})
  wrapper.update()

  expect(wrapper.find('BusySpinner').exists()).toBe(true)
  expect(wrapper.find('TaskCompletionStep1').exists()).toBe(false)
  expect(wrapper.find('TaskCompletionStep2').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})
