import React from 'react'
import _cloneDeep from 'lodash/cloneDeep'
import TaskTrackControls from './TaskTrackControls'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'

let basicProps = null

beforeEach(() => {
  basicProps = {
    task: {
      id: 123,
      status: TaskStatus.fixed,
      parent: {
        id: 321,
      }
    },
    user: {
      id: 357,
      savedTasks: [],
      isLoggedIn: true,
    },
    saveTask: jest.fn(),
    unsaveTask: jest.fn(),
    intl: {formatMessage: jest.fn()},
  }
})

test("the toggle switch is not checked if the task is not saved", () => {
  const wrapper = shallow(
    <TaskTrackControls {...basicProps} />
  )

  expect(
    wrapper.find('.task-track-controls input[checked=true]').exists()
  ).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("the toggle switch is checked if the task is saved", () => {
  basicProps.user.savedTasks.push({id: basicProps.task.id})

  const wrapper = shallow(
    <TaskTrackControls {...basicProps} />
  )

  expect(
    wrapper.find('.task-track-controls input[checked=true]').exists()
  ).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("toggling when not saved signals that the task should be saved", () => {
  const wrapper = shallow(
    <TaskTrackControls {...basicProps} />
  )

  wrapper.find('.task-track-controls .field').simulate('click')

  expect(
    basicProps.saveTask
  ).toBeCalledWith(basicProps.user.id, basicProps.task.id)
})

test("toggling when saved signals that the task should be unsaved", () => {
  basicProps.user.savedTasks.push({id: basicProps.task.id})

  const wrapper = shallow(
    <TaskTrackControls {...basicProps} />
  )

  wrapper.find('.task-track-controls .field').simulate('click')

  expect(
    basicProps.unsaveTask
  ).toBeCalledWith(basicProps.user.id, basicProps.task.id)
})
