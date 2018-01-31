import React from 'react'
import ChallengeShareControls from './ChallengeShareControls'
import _cloneDeep from 'lodash/cloneDeep'

const propsFixture = {
  challenge: {
    id: 123,
  },
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)
})

test("renders with props as expected", () => {
  const wrapper = shallow(
    <ChallengeShareControls {...basicProps} />
  )

  expect(wrapper.find('.challenge-share-controls').exists()).toBe(true)
  expect(wrapper.find('.share-icon').length).toBe(3)
  expect(wrapper).toMatchSnapshot()
})

test("does not explode with null challenge", () => {
  const wrapper = shallow(
    <ChallengeShareControls />
  )

  expect(wrapper).toMatchSnapshot()
})

test("renders with props className in encapsulating div", () => {
  const wrapper = shallow(
    <ChallengeShareControls {...basicProps} className="my-test"/>
  )

  expect(wrapper.find('.my-test').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})
