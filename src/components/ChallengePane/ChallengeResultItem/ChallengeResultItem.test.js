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
      name: "Challenge-309",
      blurb: "Challenge 309 blurb",
      description: "Challenge 309 description",
      difficulty: ChallengeDifficulty.expert,
      parent: {
        displayName: "foo",
      }
    },
    browsedChallenge: null,
    startChallenge: jest.fn(),
    saveChallenge: jest.fn(),
    unsaveChallenge: jest.fn(),
    startBrowsingChallenge: jest.fn(),
    stopBrowsingChallenge: jest.fn(),
    intl: {formatMessage: jest.fn()},
    isStarting: false,
  }
})

test("renders with props as expected", () => {
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('.challenge-list__item').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("shows the name of the challenge", () => {
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(
    wrapper.find('.challenge-list__item__name').text()
  ).toBe(basicProps.challenge.name)
  expect(wrapper).toMatchSnapshot()
})

test("shows the name of the parent project", () => {
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(
    wrapper.find('.challenge-list__item__project-name').children().first().text()
  ).toBe(basicProps.challenge.parent.displayName)
  expect(wrapper).toMatchSnapshot()
})

test("skips the project name if not available, e.g. for virtual challenges", () => {
  basicProps.challenge.parent = undefined

  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('.challenge-list__item__project-name').exists()).toBe(false)
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

test("renders virtual challenges with a virtual-challenge icon", () => {
  basicProps.challenge.featured = true
  basicProps.challenge.isVirtual = true

  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(
    wrapper.find('.challenge-list__item-indicator-icon.virtual').exists()
  ).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("doesn't show virtual-challenge icon for standard challenges", () => {
  basicProps.challenge.featured = true
  basicProps.challenge.isVirtual = false

  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(
    wrapper.find('.challenge-list__item-indicator-icon.virtual'
  ).exists()).toBe(false)

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
  basicProps.browsedChallenge = basicProps.challenge
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('.challenge-list__item.is-active').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("shows a challenge leaderboard link when being actively browsed", () => {
  basicProps.browsedChallenge = basicProps.challenge
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('.challenge-list__item__leaderboard').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("skips a challenge leaderboard link for virtual challenges", () => {
  basicProps.browsedChallenge = basicProps.challenge
  basicProps.challenge.isVirtual = true

  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('.challenge-list__item__leaderboard').exists()).toBe(false)
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
  basicProps.browsedChallenge = basicProps.challenge

  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  wrapper.find('.card-header').simulate('click')
  jest.runAllTimers()

  expect(basicProps.stopBrowsingChallenge).toBeCalled()
})

test("when start challenge button is clicked startChallenge is called", () => {
  basicProps.browsedChallenge = basicProps.challenge
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  wrapper.find('.start-challenge').simulate('click')
  expect(basicProps.startChallenge.mock.calls.length).toBe(1)
  expect(wrapper).toMatchSnapshot()
})

test("Save and Unsave toggles do not show if there is no user", () => {
  basicProps.user = null
  basicProps.browsedChallenge = basicProps.challenge
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('.challenge-list__item').exists()).toBe(true)
  expect(wrapper.find('.save-challenge-toggle').exists()).toBe(false)
  expect(wrapper).toMatchSnapshot()
})

test("when save challenge button is clicked saveChallenge is called", () => {
  basicProps.browsedChallenge = basicProps.challenge
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  wrapper.find('.save-challenge-toggle').simulate('click')
  expect(basicProps.saveChallenge.mock.calls.length).toBe(1)
  expect(wrapper).toMatchSnapshot()
})

test("when unsave challenge button is clicked saveChallenge is called", () => {
  basicProps.browsedChallenge = basicProps.challenge
  basicProps.user.savedChallenges = [{id: basicProps.challenge.id}]
  const wrapper = shallow(
    <ChallengeResultItem {...basicProps} />
  )

  expect(wrapper.find('SvgSymbol').getElement().props.sym).toBe("heart-icon")
  wrapper.find('.save-challenge-toggle').simulate('click')
  expect(basicProps.unsaveChallenge.mock.calls.length).toBe(1)
  expect(wrapper).toMatchSnapshot()
})
