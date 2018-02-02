import React from 'react'
import { ChallengeResultItem } from './ChallengeResultItem'
import { ChallengeDifficulty }
       from '../../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'

jest.useFakeTimers()

let basicProps = null

beforeEach(() => {
  basicProps = {
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
    browsingChallenge: null,
    startChallenge: jest.fn(),
    saveChallenge: jest.fn(),
    unsaveChallenge: jest.fn(),
    startBrowsingChallenge: jest.fn(),
    stopBrowsingChallenge: jest.fn(),
    intl: {formatMessage: jest.fn()},
  }
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

test("shows collapsed view if not being actively browsed", () => {
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('.challenge-list__item.is-active').exists()).toBe(false)
  expect(wrapper).toMatchSnapshot()
})

test("shows expanded view if being actively browsed", () => {
  basicProps.browsingChallenge = basicProps.challenge
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('.challenge-list__item.is-active').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("clicking when inactive signals that user wants to browse", () => {
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  wrapper.find('.card-header').simulate('click')
  jest.runAllTimers()

  expect(basicProps.startBrowsingChallenge).toBeCalledWith(basicProps.challenge)
})

test("clicking when active challenge signals that user is done browsing", () => {
  basicProps.browsingChallenge = basicProps.challenge

  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  wrapper.find('.card-header').simulate('click')
  jest.runAllTimers()

  expect(basicProps.stopBrowsingChallenge).toBeCalled()
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
