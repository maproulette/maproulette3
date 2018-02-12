import React, { Component } from 'react'
import _findIndex from 'lodash/findIndex'
import WithSortedChallenges from './WithSortedChallenges'

let basicProps = null
let WrappedComponent = null
let normalChallenge = null
let featuredChallenge = null
let savedChallenge = null
let featuredAndSavedChallenge = null

beforeEach(() => {
  normalChallenge = {id: 1}
  featuredChallenge = {id: 2, featured: true}
  savedChallenge = {id: 3 }
  featuredAndSavedChallenge = {id: 4, featured: true}

  basicProps = {
    user: {
      savedChallenges: []
    },
    challenges: [
      normalChallenge,
      featuredChallenge,
      savedChallenge,
      featuredAndSavedChallenge,
    ]
  }

  WrappedComponent = WithSortedChallenges(
    () => <div className="child" />
  )
})

test("all challenges are passed through to the wrapped component", () => {
  const wrapper = shallow(
    <WrappedComponent {...basicProps} />
  )

  expect(wrapper.props().challenges.length).toEqual(basicProps.challenges.length)

  expect(wrapper).toMatchSnapshot()
})

test("featured challenges come ahead of normal challenges", () => {
  const wrapper = shallow(
    <WrappedComponent {...basicProps} />
  )

  const sortedChallenges = wrapper.props().challenges

  expect(
    sortedChallenges.indexOf(featuredChallenge)
  ).toBeLessThan(
    sortedChallenges.indexOf(normalChallenge)
  )

  expect(wrapper).toMatchSnapshot()
})

test("challenges saved by the user come ahead of normal challenges", () => {
  basicProps.user.savedChallenges = [savedChallenge]

  const wrapper = shallow(
    <WrappedComponent {...basicProps} />
  )

  const sortedChallenges = wrapper.props().challenges

  expect(
    sortedChallenges.indexOf(savedChallenge)
  ).toBeLessThan(
    sortedChallenges.indexOf(normalChallenge)
  )

  expect(wrapper).toMatchSnapshot()
})

test("saved and featured challenges come ahead of everything else", () => {
  basicProps.user.savedChallenges = [savedChallenge, featuredAndSavedChallenge]

  const wrapper = shallow(
    <WrappedComponent {...basicProps} />
  )

  const sortedChallenges = wrapper.props().challenges

  expect(
    sortedChallenges.indexOf(featuredAndSavedChallenge)
  ).toBeLessThan(
    sortedChallenges.indexOf(featuredChallenge)
  )

  expect(
    sortedChallenges.indexOf(featuredAndSavedChallenge)
  ).toBeLessThan(
    sortedChallenges.indexOf(savedChallenge)
  )

  expect(
    sortedChallenges.indexOf(featuredAndSavedChallenge)
  ).toBeLessThan(
    sortedChallenges.indexOf(normalChallenge)
  )

  expect(wrapper).toMatchSnapshot()
})
