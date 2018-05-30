import React from 'react'
import _cloneDeep from 'lodash/cloneDeep'
import TaskRandomnessControl from './TaskRandomnessControl'
import { TaskLoadMethod }
       from '../../../services/Task/TaskLoadMethod/TaskLoadMethod'

let challengeId = null
let basicProps = null

beforeEach(() => {
  challengeId = 321

  basicProps = {
    challengeId,
    task: {
      id: 123,
      parent: {
        id: challengeId,
      }
    },
    user: {
      id: 357,
      isLoggedIn: true,
    },
    taskLoadBy: TaskLoadMethod.random,
    setTaskLoadBy: jest.fn(),
    intl: {formatMessage: jest.fn()},
  }
})

test("random option is selected if tasks are to be loaded by random ", () => {
  const wrapper = shallow(
    <TaskRandomnessControl {...basicProps} taskLoadBy={TaskLoadMethod.random} />
  )

  expect(
    wrapper.find('.task-randomness-control__random-option[checked=true]').exists()
  ).toBe(true)
  expect(
    wrapper.find('.task-randomness-control__proximity-option[checked=true]').exists()
  ).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("proximity option is selected if tasks are to be loaded by promixity ", () => {
  const wrapper = shallow(
    <TaskRandomnessControl {...basicProps} taskLoadBy={TaskLoadMethod.proximity} />
  )

  expect(
    wrapper.find('.task-randomness-control__proximity-option[checked=true]').exists()
  ).toBe(true)
  expect(
    wrapper.find('.task-randomness-control__random-option[checked=true]').exists()
  ).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("selecting promixity option signals change to taskLoadBy preference", () => {
  const wrapper = shallow(
    <TaskRandomnessControl {...basicProps} />
  )

  wrapper.find('.task-randomness-control__proximity-option').simulate('change')
  expect(
    basicProps.setTaskLoadBy
  ).toHaveBeenCalledWith(challengeId, false, TaskLoadMethod.proximity)
})

test("selecting random option signals change to taskLoadBy preference", () => {
  const wrapper = shallow(
    <TaskRandomnessControl {...basicProps} taskLoadBy={TaskLoadMethod.proximity} />
  )

  wrapper.find('.task-randomness-control__random-option').simulate('change')
  expect(
    basicProps.setTaskLoadBy
  ).toHaveBeenCalledWith(challengeId, false, TaskLoadMethod.random)
})
