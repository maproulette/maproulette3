import React, { Component } from 'react'
import _findIndex from 'lodash/findIndex'
import { sortChallenges } from './WithSortedChallenges'

let basicProps = null
let WrappedComponent = null
let normalChallenge = null
let featuredChallenge = null
let savedChallenge = null
let featuredAndSavedChallenge = null
let named1Challenge = null
let named2Challenge = null
let named3Challenge = null

beforeEach(() => {
  normalChallenge = {id: 1}
  featuredChallenge = {id: 2, featured: true}
  savedChallenge = {id: 3 }
  featuredAndSavedChallenge = {id: 4, featured: true}
  named1Challenge = {id: 5, name:'Z' }
  named2Challenge = {id: 6, name: 'A' }
  named3Challenge = {id: 7, name: 'D'}

  basicProps = {
    user: {
      savedChallenges: []
    },
    challenges: [
      normalChallenge,
      featuredChallenge,
      savedChallenge,
      featuredAndSavedChallenge,
      named1Challenge,
      named2Challenge,
      named3Challenge,
    ]
  }
})

test("by default featured challenges come ahead of normal challenges", () => {
  const sortedChallenges = sortChallenges(basicProps)

  expect(
    sortedChallenges.indexOf(featuredChallenge)
  ).toBeLessThan(
    sortedChallenges.indexOf(normalChallenge)
  )
})

test("by default challenges saved by the user come ahead of normal challenges", () => {
  basicProps.user.savedChallenges = [savedChallenge]
  const sortedChallenges = sortChallenges(basicProps)

  expect(
    sortedChallenges.indexOf(savedChallenge)
  ).toBeLessThan(
    sortedChallenges.indexOf(normalChallenge)
  )
})

test("by default saved and featured challenges come ahead of everything else", () => {
  basicProps.user.savedChallenges = [savedChallenge, featuredAndSavedChallenge]
  const sortedChallenges = sortChallenges(basicProps)

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


})

test("challenges can be sorted by name", () => {
  basicProps.searchSort = {sortBy: 'name'}
  const sortedChallenges = sortChallenges(basicProps)

  expect(
    sortedChallenges.indexOf(named2Challenge)
  ).toBeLessThan(
    sortedChallenges.indexOf(named3Challenge))

  expect(
    sortedChallenges.indexOf(named2Challenge)
  ).toBeLessThan(
    sortedChallenges.indexOf(named1Challenge))
})
