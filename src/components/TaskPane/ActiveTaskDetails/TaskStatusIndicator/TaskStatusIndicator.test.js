import React from 'react'
import TaskStatusIndicator from './TaskStatusIndicator'
import { TaskStatus }
       from '../../../../services/Task/TaskStatus/TaskStatus'

let basicProps = null

beforeEach(() => {
  basicProps = {
    task: {
      id: 123,
      parent: {
        id: 321,
      },
      status: TaskStatus.skipped,
    },
    intl: {formatMessage: jest.fn(m => m.defaultMessage)},
    isMinimized: false,
  }
})

test("shows the task status for a non-created status", () => {
  const wrapper = shallow(
    <TaskStatusIndicator {...basicProps} />
  )

  expect(wrapper.find('.task-status').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("does not show the task status for created status by default", () => {
  basicProps.task.status = TaskStatus.created

  const wrapper = shallow(
    <TaskStatusIndicator {...basicProps} />
  )

  expect(wrapper.find('.task-status').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("does show created task status if allStatuses is set to true", () => {
  basicProps.task.status = TaskStatus.created

  const wrapper = shallow(
    <TaskStatusIndicator {...basicProps} allStatuses />
  )

  expect(wrapper.find('.task-status').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("shows popout control when minimized", () => {
  basicProps.isMinimized = true

  const wrapper = shallow(
    <TaskStatusIndicator {...basicProps} />
  )

  expect(wrapper.find('.task-status-popout').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})
