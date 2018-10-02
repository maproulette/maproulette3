import React from 'react'
import { ChallengePane } from './ChallengePane'
import { ChallengeDifficulty }
       from '../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'

let challenge = null
let basicProps = null

beforeEach(() => {
  challenge = {
    id: 123,
  }

  basicProps = {
    user: {
      id: 11,
      savedChallenges: [],
    },
    startChallenge: jest.fn(),
    saveChallenge: jest.fn(),
    unsaveChallenge: jest.fn(),
    intl: {formatMessage: jest.fn()},
  }
})

test("renders with props as expected", () => {
  const wrapper = shallow(
    <ChallengePane {...basicProps} />
  )

  expect(wrapper.find('.challenge-pane').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("when no browsed challenge, the locator map is rendered", () => {
  const wrapper = shallow(
    <ChallengePane {...basicProps} />
  )

  expect(
    wrapper.find('Connect(Component)').exists()
  ).toBe(true)
})

test("when browsing a challenge, the challenge map is rendered", () => {
  basicProps.browsedChallenge = challenge

  const wrapper = shallow(
    <ChallengePane {...basicProps} />
  )

  expect(
    wrapper.find('Connect(Connect(Connect(Connect(Component))))').exists()
  ).toBe(true)

  expect(wrapper).toMatchSnapshot()
})
