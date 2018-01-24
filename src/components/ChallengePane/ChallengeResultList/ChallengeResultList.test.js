import React from 'react'
import { ChallengeResultList } from './ChallengeResultList'
import { cloneDeep as _cloneDeep } from 'lodash'

const propsFixture = {
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
      parent: {
        displayName: "foo",
      }
    },
    {
      id: 311,
      name: "Challenge 311",
      blurb: "Challenge 311 blurb",
      description: "Challenge 311 description",
      parent: {
        displayName: "bar",
      }
    },
  ],
  challengeDifficulty: 3
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)
  basicProps.startChallenge = jest.fn()
  basicProps.saveChallenge = jest.fn()
  basicProps.unsaveChallenge = jest.fn()
  basicProps.intl = {formatMessage: jest.fn()}
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
