import React from 'react'
import { ChallengeDifficulty }
       from '../../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'
import { ChallengeResultList } from './ChallengeResultList'
import _cloneDeep from 'lodash/cloneDeep'

let basicProps = null

beforeEach(() => {
  basicProps = {
    user: {
      id: 11,
      savedChallenges: [],
    },
    challenges: [
      {
        id: 309,
        name: "Challenge 309",
        blurb: "Challenge 309 blurb",
        description: "Challenge 309 description",
        difficulty: ChallengeDifficulty.expert,
        parent: {
          displayName: "foo",
        }
      },
      {
        id: 311,
        name: "Challenge 311",
        blurb: "Challenge 311 blurb",
        description: "Challenge 311 description",
        difficulty: ChallengeDifficulty.expert,
        parent: {
          displayName: "bar",
        }
      },
    ],
    startChallenge: jest.fn(),
    saveChallenge: jest.fn(),
    unsaveChallenge: jest.fn(),
    intl: {formatMessage: jest.fn()},
  }
})

test("renders with props as expected", () => {
  const wrapper = shallow(
    <ChallengeResultList {...basicProps} />
  )

  expect(wrapper.find('.challenge-result-list__challenge-list').exists()).toBe(true)
  expect(wrapper.find('InjectIntl(ChallengeResultItem)').length).toBe(2)
  expect(wrapper).toMatchSnapshot()
})

test("renders with no challenges", () => {
  basicProps.challenges = []
  const wrapper = shallow(
    <ChallengeResultList {...basicProps} />
  )

  expect(wrapper.find('.no-results').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("renders with props className in encapsulating div", () => {
  const wrapper = shallow(
    <ChallengeResultList {...basicProps} className="my-test"/>
  )

  expect(wrapper.find('.my-test').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("renders with a busySpinner if props fetchingChallenges", () => {
  const fetchingChallenges = basicProps.challenges
  basicProps.challenges = []

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} fetchingChallenges={fetchingChallenges} />
  )

  expect(wrapper.find('BusySpinner').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("always includes actively browsed challenge in the result list", () => {
  const browsed = basicProps.challenges[0]
  basicProps.challenges = []

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} browsedChallenge={browsed} />
  )

  expect(wrapper.find('.challenge-result-list__challenge-list').exists()).toBe(true)
  expect(wrapper.find('InjectIntl(ChallengeResultItem)').length).toBe(1)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't duplicate actively browsed challenge in the result list", () => {
  const browsed = basicProps.challenges[0]
  basicProps.challenges = [browsed]

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} browsedChallenge={browsed} />
  )

  expect(wrapper.find('.challenge-result-list__challenge-list').exists()).toBe(true)
  expect(wrapper.find('InjectIntl(ChallengeResultItem)').length).toBe(1)

  expect(wrapper).toMatchSnapshot()
})
