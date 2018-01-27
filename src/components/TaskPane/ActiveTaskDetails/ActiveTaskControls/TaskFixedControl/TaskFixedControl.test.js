import React from 'react'
import TaskFixedControl from './TaskFixedControl'
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
    complete: jest.fn(),
    intl: {formatMessage: jest.fn(m => m.defaultMessage)},
  }
})

test("shows fixed control", () => {
  const wrapper = shallow(
    <TaskFixedControl {...basicProps} />
  )

  expect(wrapper.find('.fixed-control').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the fixed button signals task completion with fixed status", () => {
  const wrapper = shallow(
    <TaskFixedControl {...basicProps} />
  )

  wrapper.find('.fixed-control').simulate('click')

  expect(basicProps.complete).toBeCalledWith(TaskStatus.fixed)
})
