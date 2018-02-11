import React from 'react'
import { ChallengeDifficulty }
       from '../../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'
import { ChallengeResultList } from './ChallengeResultList'
import _cloneDeep from 'lodash/cloneDeep'

let challenges = null
let basicProps = null

beforeEach(() => {
  challenges = [
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
  ]

  basicProps = {
    user: {
      id: 11,
      savedChallenges: [],
    },
    challenges,
    filteredChallenges: challenges,
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
  basicProps.filteredChallenges = []
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
  const fetchingChallenges = basicProps.filteredChallenges
  basicProps.filteredChallenges = []

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} fetchingChallenges={fetchingChallenges} />
  )

  expect(wrapper.find('BusySpinner').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("always includes actively browsed challenge in the result list", () => {
  const browsed = basicProps.filteredChallenges[0]
  basicProps.filteredChallenges = []

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} browsedChallenge={browsed} />
  )

  expect(wrapper.find('.challenge-result-list__challenge-list').exists()).toBe(true)
  expect(wrapper.find('InjectIntl(ChallengeResultItem)').length).toBe(1)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't duplicate actively browsed challenge in the result list", () => {
  const browsed = basicProps.filteredChallenges[0]
  basicProps.filteredChallenges = [browsed]

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} browsedChallenge={browsed} />
  )

  expect(wrapper.find('.challenge-result-list__challenge-list').exists()).toBe(true)
  expect(wrapper.find('InjectIntl(ChallengeResultItem)').length).toBe(1)

  expect(wrapper).toMatchSnapshot()
})

test("shows a clear-filters button if some challenges are filtered", () => {
  basicProps.filteredChallenges = [challenges[0]]

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} />
  )

  expect(
    wrapper.find('.challenge-result-list__clear-filters-control').exists()
  ).toBe(true)
})

test("does not show a clear-filters button if no challenges filtered", () => {
  basicProps.filteredChallenges = challenges

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} />
  )

  expect(
    wrapper.find('.challenge-result-list__clear-filters-control').exists()
  ).not.toBe(true)
})
