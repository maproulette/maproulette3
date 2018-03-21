import React from 'react'
import { ChallengeProgress } from './ChallengeProgress'
import _cloneDeep from 'lodash/cloneDeep'

let basicProps = null

beforeEach(() => {
  basicProps = {
    challenge: {
      id: 123,
      actions: {total: 5, available: 3, completed: 2}
    },
    intl: {formatMessage: jest.fn()},
  }
})

test("renders with props as expected", () => {
  const wrapper = shallow(
    <ChallengeProgress {...basicProps} />
  )

  expect(wrapper.find('.challenge-task-progress').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("does not explode with null challenge", () => {
  delete basicProps.challenge
  const wrapper = shallow(
    <ChallengeProgress {...basicProps} />
  )

  expect(wrapper).toMatchSnapshot()
})
