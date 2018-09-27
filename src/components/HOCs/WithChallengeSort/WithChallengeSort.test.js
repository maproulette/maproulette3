import React, { Component } from 'react'
import { mapStateToProps, mapDispatchToProps } from './WithChallengeSort'
import { setSort, removeSort } from '../../../services/Sort/Sort'
import { extendedFind } from '../../../services/Challenge/Challenge'

jest.mock('../../../services/Sort/Sort')
jest.mock('../../../services/Challenge/Challenge')

let basicState = null

beforeEach(() => {
  basicState = {
    challengeFilter: {
      difficulty: 'hard',
      featured: true,
      keywords: 'testing',
      location: 'USA',
    },
    searchQueries: {
      challenges: {
        searchQuery: {
          query: "Alaska"
        }
      }
    },
    currentSort: {
      sortBy: 'name',
      direction: 'asc'
    }
  }
})

test("mapDispatchToProps maps call extendedFind to kick off a server sorted search", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch, basicState)

  mappedProps.setChallengeSort({sortBy: 'name', direction: 'desc'})
  expect(dispatch).toBeCalled()
  expect(extendedFind).toBeCalledWith(
    {"filters": {"difficulty": "hard", "featured": true, "keywords": "testing", "location": "USA"},
     "searchQuery": "Alaska",
     "sortCriteria": {"direction": "desc", "sortBy": "name"}
   }
  )
})

test("mapDispatchToProps maps call setChallengeSort: 'name' sort gets an 'desc' direction", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch)
  const sortSetting = {sortBy: 'name'}

  mappedProps.setChallengeSort(sortSetting)
  expect(dispatch).toBeCalled()
  expect(setSort).toBeCalledWith('challenge', {sortBy: 'name', direction: 'desc'})
})

test("mapDispatchToProps maps call setChallengeSort: 'created' sort gets an 'asc' direction", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch)
  const sortSetting = {sortBy: 'created'}

  mappedProps.setChallengeSort(sortSetting)
  expect(dispatch).toBeCalled()
  expect(setSort).toBeCalledWith('challenge', {sortBy: 'created', direction: 'asc'})
})

test("mapDispatchToProps maps call setChallengeSort: 'xxx' sort is set to null", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch)
  const sortSetting = {sortBy: 'xxx'}

  mappedProps.setChallengeSort(sortSetting)
  expect(dispatch).toBeCalled()
  expect(setSort).toBeCalledWith('challenge', {sortBy: null, direction: null})
})

test("mapDispatchToProps maps call removeChallengeFilters", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch)
  const sortSetting = {a: 1}

  mappedProps.removeChallengeSort(sortSetting)
  expect(dispatch).toBeCalled()
  expect(removeSort).toBeCalledWith('challenge', sortSetting)
})
