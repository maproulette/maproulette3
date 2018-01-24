import React from 'react'
import { omit as _omit, cloneDeep as _cloneDeep } from 'lodash'
import TaskDoneControls from './TaskDoneControls'
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'

const propsFixture = {
  task: {
    id: 123,
    status: TaskStatus.fixed,
    parent: {
      id: 321,
    }
  },
  user: {
    id: 357,
    settings: {defaultEditor: 1},
    isLoggedIn: true,
  },
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)

  basicProps.nextTask = jest.fn()
  basicProps.intl = {formatMessage: jest.fn()}
})

test("it renders the completed status of the task", () => {
  const wrapper = shallow(
    <TaskDoneControls {...basicProps} />
  )

  expect(wrapper.find('.task-done-controls--task-status-message').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the next button signals that a new task should be loaded", () => {
  const wrapper = shallow(
    <TaskDoneControls {...basicProps} />
  )

  wrapper.find('.task-done-controls__next').simulate('click')

  expect(basicProps.nextTask.mock.calls.length).toBe(1)
  expect(basicProps.nextTask.mock.calls[0][0]).toBe(basicProps.task.parent.id)
  expect(basicProps.nextTask.mock.calls[0][1]).toBe(basicProps.task.id)
})
