import React from 'react'
import TaskNextControl from './TaskNextControl'
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
    nextTask: jest.fn(),
    intl: {formatMessage: jest.fn(m => m.defaultMessage)},
    isMinimized: false,
  }
})

test("shows next control", () => {
  const wrapper = shallow(
    <TaskNextControl {...basicProps} />
  )

  expect(wrapper.find('.next-control').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("shows icon-only control when minimized", () => {
  basicProps.isMinimized = true

  const wrapper = shallow(
    <TaskNextControl {...basicProps} />
  )

  expect(wrapper.find('.next-control.icon-only').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the next button signals loading of a new task", () => {
  const wrapper = shallow(
    <TaskNextControl {...basicProps} />
  )

  wrapper.find('.next-control').simulate('click')

  expect(basicProps.nextTask).toBeCalled()
})
