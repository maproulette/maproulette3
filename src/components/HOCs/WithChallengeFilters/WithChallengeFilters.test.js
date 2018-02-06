import React, { Component } from 'react'
import { mapStateToProps, mapDispatchToProps } from './WithChallengeFilters'
import { setFilters, removeFilters } from '../../../services/Filter/Filter'

jest.mock('../../../services/Filter/Filter')

let basicState = null

beforeEach(() => {
  basicState = {
    currentFilters: {
      challenge:
      {
        difficulty: 'hard',
        featured: true,
        keywords: 'testing',
        location: 'USA',
      }
    }
  }
})

test("mapStateToProps maps 'difficulty', 'featured', 'keywords', 'location' to challengeFilter", () => {
  const mappedProps = mapStateToProps(basicState)

  expect(
    mappedProps.challengeCriteria
  ).toMatchObject(basicState.currentFilters.challenge)

  expect(
    mappedProps.challengeFilter
  ).toMatchObject(basicState.currentFilters.challenge)
})

test("mapDispatchToProps maps call setChallengeFilters", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch)
  const filterSetting = {a: 1}

  mappedProps.setChallengeFilters(filterSetting)
  expect(dispatch).toBeCalled()
  expect(setFilters).toBeCalledWith('challenge', filterSetting)
})

test("mapDispatchToProps maps call removeChallengeFilters", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch)
  const filterSetting = {a: 1}

  mappedProps.removeChallengeFilters(filterSetting)
  expect(dispatch).toBeCalled()
  expect(removeFilters).toBeCalledWith('challenge', filterSetting)
})

test("mapDispatchToProps maps call setKeywordFilter", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch)
  const keywords = ["foo", "bar"]

  mappedProps.setKeywordFilter(keywords)
  expect(dispatch).toBeCalled()
  expect(setFilters).toBeCalledWith('challenge',
                                    expect.objectContaining({keywords}))
})
