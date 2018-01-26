import React from 'react'
import { omit as _omit, cloneDeep as _cloneDeep } from 'lodash'
import TaskSaveControls from './TaskSaveControls'
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
    savedTasks: [],
    isLoggedIn: true,
  },
  intl: {formatMessage: jest.fn()},
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)

  basicProps.saveTask = jest.fn()
  basicProps.unsaveTask = jest.fn()
})

test("it renders a save button if the task has not been saved by the user", () => {
  const wrapper = shallow(
    <TaskSaveControls {...basicProps} />
  )

  expect(wrapper.find('.button.save-task').exists()).toBe(true)
  expect(wrapper.find('.button.unsave-task').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the save button signals that the task should be saved", () => {
  const wrapper = shallow(
    <TaskSaveControls {...basicProps} />
  )

  wrapper.find('.button.save-task').simulate('click')

  expect(basicProps.saveTask.mock.calls.length).toBe(1)
  expect(basicProps.saveTask.mock.calls[0][0]).toBe(basicProps.user.id)
  expect(basicProps.saveTask.mock.calls[0][1]).toBe(basicProps.task.id)
})

test("it renders an unsave button if the task has already been saved by the user", () => {
  basicProps.user.savedTasks.push({id: basicProps.task.id})

  const wrapper = shallow(
    <TaskSaveControls {...basicProps} />
  )

  expect(wrapper.find('.button.unsave-task').exists()).toBe(true)
  expect(wrapper.find('.button.save-task').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the unsave button signals that the task should be unsaved", () => {
  basicProps.user.savedTasks.push({id: basicProps.task.id})

  const wrapper = shallow(
    <TaskSaveControls {...basicProps} />
  )

  wrapper.find('.button.unsave-task').simulate('click')

  expect(basicProps.unsaveTask.mock.calls.length).toBe(1)
  expect(basicProps.unsaveTask.mock.calls[0][0]).toBe(basicProps.user.id)
  expect(basicProps.unsaveTask.mock.calls[0][1]).toBe(basicProps.task.id)
})
