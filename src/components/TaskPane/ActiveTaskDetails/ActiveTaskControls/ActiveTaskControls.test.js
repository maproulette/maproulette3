import React from 'react'
import { omit as _omit, cloneDeep as _cloneDeep } from 'lodash'
import { ActiveTaskControls } from './ActiveTaskControls'
import keyMappings from '../../../../KeyMappings'
import { TaskStatus } from '../../../../services/Task/TaskStatus/TaskStatus'

const propsFixture = {
  task: {
    id: 123,
  },
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
  },
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)

  basicProps.editTask = jest.fn()
  basicProps.completeTask = jest.fn()
  basicProps.nextTask = jest.fn()
  basicProps.setTaskBeingCompleted = jest.fn()
  basicProps.activateKeyboardShortcuts = jest.fn()
  basicProps.deactivateKeyboardShortcuts = jest.fn()
  basicProps.closeEditor = jest.fn()
  basicProps.intl = {formatMessage: jest.fn()}
})

test("already-done controls are shown if the task is in a completed status.", () => {
  basicProps.task.status = TaskStatus.fixed
  const wrapper = shallow(
    <ActiveTaskControls {...basicProps} />
  )

  expect(wrapper.find('TaskDoneControls').exists()).toBe(true)
  expect(wrapper.find('TaskEditControls').exists()).toBe(false)
  expect(wrapper.find('TaskCompletionControls').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("completion controls are shown if the user has begun editing the task", () => {
  basicProps.task.status = TaskStatus.created
  basicProps.editor.taskId = basicProps.task.id
  basicProps.editor.success = true

  const wrapper = shallow(
    <ActiveTaskControls {...basicProps} />
  )

  expect(wrapper.find('TaskCompletionControls').exists()).toBe(true)
  expect(wrapper.find('TaskDoneControls').exists()).toBe(false)
  expect(wrapper.find('TaskEditControls').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("edit controls are shown if the user has not yet begun editing the task", () => {
  basicProps.task.status = TaskStatus.created

  const wrapper = shallow(
    <ActiveTaskControls {...basicProps} />
  )

  expect(wrapper.find('TaskEditControls').exists()).toBe(true)
  expect(wrapper.find('TaskCompletionControls').exists()).toBe(false)
  expect(wrapper.find('TaskDoneControls').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("a busy spinner is shown when switching from edit controls to completion controls", () => {
  basicProps.task.status = TaskStatus.created

  const wrapper = shallow(
    <ActiveTaskControls {...basicProps} />
  )
  
  wrapper.instance().setTaskBeingCompleted(basicProps.task.id)
  wrapper.update()

  expect(wrapper.find('BusySpinner').exists()).toBe(true)
  expect(wrapper.find('TaskEditControls').exists()).toBe(false)
  expect(wrapper.find('TaskCompletionControls').exists()).toBe(false)
  expect(wrapper.find('TaskDoneControls').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})
