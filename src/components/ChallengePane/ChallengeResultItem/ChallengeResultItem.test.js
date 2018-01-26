import React from 'react'
import { ChallengeResultItem } from './ChallengeResultItem'
import { ChallengeDifficulty }
       from '../../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'
import { cloneDeep as _cloneDeep } from 'lodash'

const propsFixture = {
  user: {
    id: 11,
    savedChallenges: [],
  },
  challenge: {
    id: 309,
    name: "Challenge 309",
    blurb: "Challenge 309 blurb",
    description: "Challenge 309 description",
    difficulty: ChallengeDifficulty.expert,
    parent: {
      displayName: "foo",
    }
  },
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
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('.challenge-list__item').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("renders featured challenges with a featured icon", () => {
  basicProps.challenge.featured = true
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('.challenge-list__item--featured-indicator').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("when clicked the challenge becomes active", () => {
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('.is-active').exists()).toBe(false)
  wrapper.find('.card-header').simulate('click')
  expect(wrapper.find('.is-active').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("when start challenge button is clicked startChallenge is called", () => {
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  wrapper.find('.start-challenge').simulate('click')
  expect(basicProps.startChallenge.mock.calls.length).toBe(1)
  expect(wrapper).toMatchSnapshot()
})

test("Save and Unsave toggles do not show if there is no user", () => {
  basicProps.user = null
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('.challenge-list__item').exists()).toBe(true)
  expect(wrapper.find('.save-challenge-toggle').exists()).toBe(false)
  expect(wrapper).toMatchSnapshot()
})

test("when save challenge button is clicked saveChallenge is called", () => {
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  wrapper.find('.save-challenge-toggle').simulate('click')
  expect(basicProps.saveChallenge.mock.calls.length).toBe(1)
  expect(wrapper).toMatchSnapshot()
})

test("when unsave challenge button is clicked saveChallenge is called", () => {
  basicProps.user.savedChallenges = [{id: basicProps.challenge.id}]
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('SvgSymbol').getElement().props.sym).toBe("heart-icon")
  wrapper.find('.save-challenge-toggle').simulate('click')
  expect(basicProps.unsaveChallenge.mock.calls.length).toBe(1)
  expect(wrapper).toMatchSnapshot()
})
