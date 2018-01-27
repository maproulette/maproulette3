import React from 'react'
import TaskTooHardControl from './TaskTooHardControl'
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

test("shows too-hard control", () => {
  const wrapper = shallow(
    <TaskTooHardControl {...basicProps} />
  )

  expect(wrapper.find('.too-hard-control').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the too-hard button signals task completion with tooHard status", () => {
  const wrapper = shallow(
    <TaskTooHardControl {...basicProps} />
  )

  wrapper.find('.too-hard-control').simulate('click')

  expect(basicProps.complete).toBeCalledWith(TaskStatus.tooHard)
})
