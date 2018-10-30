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
    unfilteredChallenges: challenges,
    pagedChallenges: challenges,
    challenges,
    startChallenge: jest.fn(),
    saveChallenge: jest.fn(),
    unsaveChallenge: jest.fn(),
    startMapBoundedTasks: jest.fn(),
    setSearchPage: jest.fn(),
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
  basicProps.pagedChallenges = []
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
  basicProps.pagedChallenges = []

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} fetchingChallenges={fetchingChallenges} />
  )

  expect(wrapper.find('BusySpinner').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("always includes actively browsed challenge in the result list", () => {
  const browsed = basicProps.challenges[0]
  basicProps.challenges = []
  basicProps.pagedChallenges = []

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
  basicProps.pagedChallenges = [browsed]

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} browsedChallenge={browsed} />
  )

  expect(wrapper.find('.challenge-result-list__challenge-list').exists()).toBe(true)
  expect(wrapper.find('InjectIntl(ChallengeResultItem)').length).toBe(1)

  expect(wrapper).toMatchSnapshot()
})

test("shows a clear-filters button if some challenges are filtered", () => {
  basicProps.challenges = [challenges[0]]
  basicProps.pagedChallenges = [challenges[0]]

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} />
  )

  expect(
    wrapper.find('.challenge-result-list__clear-filters-control').exists()
  ).toBe(true)
})

test("does not show a clear-filters button if no challenges filtered", () => {
  basicProps.challenges = challenges

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} />
  )

  expect(
    wrapper.find('.challenge-result-list__clear-filters-control').exists()
  ).toBe(false)
})

test("shows virtual-challenge start control if map-bounded tasks", () => {
  basicProps.mapBoundedTasks = {tasks: [{id: 123}]}

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} />
  )

  expect(wrapper.find('InjectIntl(StartVirtualChallenge)').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't show virtual-challenge start control if no map-bounded tasks", () => {
  basicProps.mapBoundedTasks = {tasks: []}

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} />
  )

  expect(wrapper.find('InjectIntl(StartVirtualChallenge)').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't show virtual-challenge start control if browsing a challenge", () => {
  basicProps.mapBoundedTasks = {tasks: [{id: 123}]}
  basicProps.browsedChallenge = challenges[0]

  const wrapper = shallow(
    <ChallengeResultList {...basicProps} />
  )

  expect(wrapper.find('InjectIntl(StartVirtualChallenge)').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})
