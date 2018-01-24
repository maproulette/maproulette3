import React from 'react'
import TaskCompletionControls from './TaskCompletionControls'
import keyMappings from '../../../../../KeyMappings'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'

let basicProps = null

beforeEach(() => {
  basicProps = {
    task: {
      id: 123,
      parent: {
        id: 321,
      }
    },
    comment: "Foo",
    keyboardShortcutGroups: keyMappings,
    user: {
      id: 357,
      settings: {defaultEditor: 1},
      isLoggedIn: true,
    },
    completeTask: jest.fn(),
    setTaskBeingCompleted: jest.fn(),
    setComment: jest.fn(),
    closeEditor: jest.fn(),
    activateKeyboardShortcuts: jest.fn(),
    deactivateKeyboardShortcuts: jest.fn(),
  }
})

test("it renders completion controls", () => {
  const wrapper = shallow(
    <TaskCompletionControls {...basicProps} />
  )

  expect(wrapper.find('.task-completion-controls').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("presents a completion comment field", () => {
  const wrapper = shallow(
    <TaskCompletionControls {...basicProps} />
  )

  expect(wrapper.find(
    `TaskCommentInput[value="${basicProps.comment}"]`
  ).exists()).toBe(true)
})

test("clicking the fixed button signals task completion with fixed status", () => {
  const wrapper = shallow(
    <TaskCompletionControls {...basicProps} />
  )

  wrapper.find('.task-completion-controls__fix').simulate('click')

  expect(basicProps.closeEditor).toBeCalled()

  expect(basicProps.completeTask).toBeCalledWith(basicProps.task.id,
                                                 basicProps.task.parent.id,
                                                 TaskStatus.fixed,
                                                 basicProps.comment)

  expect(basicProps.setTaskBeingCompleted).toBeCalledWith(basicProps.task.id)
})

test("clicking the too-hard button signals task completion with too-hard status", () => {
  const wrapper = shallow(
    <TaskCompletionControls {...basicProps} />
  )

  wrapper.find('.task-completion-controls__too-hard').simulate('click')

  expect(basicProps.closeEditor).toBeCalled()

  expect(basicProps.completeTask).toBeCalledWith(basicProps.task.id,
                                                 basicProps.task.parent.id,
                                                 TaskStatus.tooHard,
                                                 basicProps.comment)

  expect(basicProps.setTaskBeingCompleted).toBeCalledWith(basicProps.task.id)
})

test("clicking the already-fixed button signals task completion with already-fixed status", () => {
  const wrapper = shallow(
    <TaskCompletionControls {...basicProps} />
  )

  wrapper.find('.task-completion-controls__already-fixed').simulate('click')

  expect(basicProps.closeEditor).toBeCalled()

  expect(basicProps.completeTask).toBeCalledWith(basicProps.task.id,
                                                 basicProps.task.parent.id,
                                                 TaskStatus.alreadyFixed,
                                                 basicProps.comment)

  expect(basicProps.setTaskBeingCompleted).toBeCalledWith(basicProps.task.id)
})

test("clicking the cancel button aborts completion of the task", () => {
  const wrapper = shallow(
    <TaskCompletionControls {...basicProps} />
  )

  wrapper.find('.task-completion-controls__cancel').simulate('click')

  expect(basicProps.closeEditor).toBeCalled()
  expect(basicProps.setTaskBeingCompleted).toBeCalledWith(null)
})
