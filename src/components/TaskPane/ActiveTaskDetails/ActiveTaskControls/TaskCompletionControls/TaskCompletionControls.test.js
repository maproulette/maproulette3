import React from 'react'
import { omit as _omit, cloneDeep as _cloneDeep } from 'lodash'
import TaskCompletionControls from './TaskCompletionControls'
import keyMappings from '../../../../../KeyMappings'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'

const propsFixture = {
  task: {
    id: 123,
    parent: {
      id: 321,
    }
  },
  keyboardShortcutGroups: keyMappings,
  user: {
    id: 357,
    settings: {defaultEditor: 1},
    isLoggedIn: true,
  },
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)

  basicProps.completeTask = jest.fn()
  basicProps.setTaskBeingCompleted = jest.fn()
  basicProps.closeEditor = jest.fn()
  basicProps.activateKeyboardShortcuts = jest.fn()
  basicProps.deactivateKeyboardShortcuts = jest.fn()
})

test("it renders completion controls", () => {
  const wrapper = shallow(
    <TaskCompletionControls {...basicProps} />
  )

  expect(wrapper.find('.task-completion-controls').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the fixed button signals task completion with fixed status", () => {
  const wrapper = shallow(
    <TaskCompletionControls {...basicProps} />
  )

  wrapper.find('.task-completion-controls__fix').simulate('click')

  expect(basicProps.closeEditor.mock.calls.length).toBe(1)
  expect(basicProps.completeTask.mock.calls.length).toBe(1)
  expect(basicProps.completeTask.mock.calls[0][0]).toBe(basicProps.task.id)
  expect(basicProps.completeTask.mock.calls[0][1]).toBe(basicProps.task.parent.id)
  expect(basicProps.completeTask.mock.calls[0][2]).toBe(TaskStatus.fixed)

})

test("clicking the too-hard button signals task completion with too-hard status", () => {
  const wrapper = shallow(
    <TaskCompletionControls {...basicProps} />
  )

  wrapper.find('.task-completion-controls__too-hard').simulate('click')

  expect(basicProps.closeEditor.mock.calls.length).toBe(1)
  expect(basicProps.completeTask.mock.calls.length).toBe(1)
  expect(basicProps.completeTask.mock.calls[0][0]).toBe(basicProps.task.id)
  expect(basicProps.completeTask.mock.calls[0][1]).toBe(basicProps.task.parent.id)
  expect(basicProps.completeTask.mock.calls[0][2]).toBe(TaskStatus.tooHard)
})

test("clicking the already-fixed button signals task completion with already-fixed status", () => {
  const wrapper = shallow(
    <TaskCompletionControls {...basicProps} />
  )

  wrapper.find('.task-completion-controls__already-fixed').simulate('click')

  expect(basicProps.closeEditor.mock.calls.length).toBe(1)
  expect(basicProps.completeTask.mock.calls.length).toBe(1)
  expect(basicProps.completeTask.mock.calls[0][0]).toBe(basicProps.task.id)
  expect(basicProps.completeTask.mock.calls[0][1]).toBe(basicProps.task.parent.id)
  expect(basicProps.completeTask.mock.calls[0][2]).toBe(TaskStatus.alreadyFixed)
})

test("clicking the cancel button aborts completion of the task", () => {
  const wrapper = shallow(
    <TaskCompletionControls {...basicProps} />
  )

  wrapper.find('.task-completion-controls__cancel').simulate('click')

  expect(basicProps.closeEditor.mock.calls.length).toBe(1)
  expect(basicProps.setTaskBeingCompleted.mock.calls.length).toBe(1)
  expect(basicProps.setTaskBeingCompleted.mock.calls[0][0]).toBe(null)
})
