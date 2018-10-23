import React, { Component } from 'react'
import { mapStateToProps, mapDispatchToProps,
         _WithSearch } from './WithSearch'
import { setSort, removeSort,
         setFilters, removeFilters,
         setSearch, clearSearch,
         performSearch } from '../../../services/Search/Search'
import { extendedFind } from '../../../services/Challenge/Challenge'
import _isFunction from 'lodash/isFunction'
import _cloneDeep from 'lodash/cloneDeep'

jest.mock('../../../services/Search/Search')
jest.mock('../../../services/Challenge/Challenge')

let basicState = null
let WrappedComponent = null
let WrappedChallengesComponent = null

let SEARCH_NAME = 'challenges'

beforeEach(() => {
  basicState = {
    searchGroup: 'challenges',
    currentSearch: {
      challenges: {
        sort: {
          sortBy: 'created',
          direction: 'desc'
        },
        filters: {
          difficulty: 'hard',
          featured: true,
          keywords: 'testing',
          location: 'USA',
        },
        mapBounds: {
          bounds: [1,2,3,4]
        }
      },
      searchQueryTest: "searchQueryValue",
    },
    setChallengeSearchMapBounds: jest.fn(),
    performSearch: jest.fn(),
  }

  WrappedComponent = _WithSearch(
    () => <div className="child" />,
    "searchQueryTest",
    jest.fn()
  )

  WrappedChallengesComponent = _WithSearch(
    () => <div className="child" />,
    "challenges",
    jest.fn()
  )
})

test("mapStateToProps maps 'difficulty', 'featured', 'keywords', 'location' to searchFilters", () => {
  const mappedProps = mapStateToProps(basicState, 'challenges')

  expect(
    mappedProps.searchFilters
  ).toMatchObject(basicState.currentSearch.challenges.filters)
})

test("mapStateToProps maps 'sortBy', 'direction', to searchSort", () => {
  const mappedProps = mapStateToProps(basicState, 'challenges')

  expect(
    mappedProps.searchSort
  ).toMatchObject(basicState.currentSearch.challenges.sort)
})

test("mapDispatchToProps maps call setSearchFilters", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch, basicState, 'challenges')
  const filterSetting = {difficulty: 1}

  mappedProps.setSearchFilters(filterSetting)
  expect(dispatch).toBeCalled()
  expect(setFilters).toBeCalledWith('challenges', filterSetting)
})

test("mapDispatchToProps maps call removeSearchFilters", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch, basicState, 'challenges')
  const filterSetting = {a: 1}

  mappedProps.removeSearchFilters(filterSetting)
  expect(dispatch).toBeCalled()
  expect(removeFilters).toBeCalledWith('challenges', filterSetting)
})

test("mapDispatchToProps maps call setKeywordFilter", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch, basicState, 'challenges')
  const keywords = ["foo", "bar"]

  mappedProps.setKeywordFilter(keywords)
  expect(dispatch).toBeCalled()
  expect(setFilters).toBeCalledWith('challenges',
                                    expect.objectContaining({keywords}))
})

test("mapDispatchToProps maps call setSearchSort: 'name' sort gets an 'asc' direction", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch, basicState, 'challenges')
  const sortSetting = {sortBy: 'name'}

  mappedProps.setSearchSort(sortSetting)
  expect(dispatch).toBeCalled()
  expect(setSort).toBeCalledWith('challenges', {sortBy: 'name', direction: 'asc'})
})

test("mapDispatchToProps maps call setSearchSort: 'created' sort gets an 'desc' direction", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch, basicState, 'challenges')
  const sortSetting = {sortBy: 'created'}

  mappedProps.setSearchSort(sortSetting)
  expect(dispatch).toBeCalled()
  expect(setSort).toBeCalledWith('challenges', {sortBy: 'created', direction: 'desc'})
})

test("mapDispatchToProps maps call setSearchSort: 'xxx' sort is set to null", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch, basicState, 'challenges')
  const sortSetting = {sortBy: 'xxx'}

  mappedProps.setSearchSort(sortSetting)
  expect(dispatch).toBeCalled()
  expect(setSort).toBeCalledWith('challenges', {sortBy: null, direction: null})
})

test("mapDispatchToProps maps call removeSearchFilters", () => {
  const dispatch = jest.fn()
  const mappedProps = mapDispatchToProps(dispatch, basicState, 'challenges')
  const sortSetting = {a: 1}

  mappedProps.removeSearchSort(sortSetting)
  expect(dispatch).toBeCalled()
  expect(removeSort).toBeCalledWith('challenges', sortSetting)
})

test("searchQueries are passed through to the wrapped component", () => {
  const wrapper = shallow(
    <WrappedComponent {...basicState} />
  )

  expect(
    wrapper.props().searchQuery
  ).toBe(basicState.currentSearch.searchQueryTest)

  expect(wrapper).toMatchSnapshot()
})

test("mapStateToProps maps currentSearch", () => {
  const mappedProps = mapStateToProps(basicState)
  expect(mappedProps.currentSearch).toEqual(basicState.currentSearch)

  expect(mappedProps).toMatchSnapshot()
})

test("mapDispatchToProps maps function setSearch", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {}, 'challenges')

  mappedProps.setSearch("query", "searchGroup")
  expect(dispatch).toBeCalled()
  expect(setSearch).toBeCalledWith("searchGroup", "query")

  expect(mappedProps).toMatchSnapshot()
})

test("mapDispatchToProps maps function clearSearch", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {}, 'challenges')

  mappedProps.clearSearch("searchGroup")
  expect(dispatch).toBeCalled()
  expect(clearSearch).toBeCalledWith("searchGroup")
})

test("searchQueries.searchGroup is passed through to the wrapped component", () => {
  const wrapper = shallow(
    <WrappedComponent {...basicState} />
  )

  expect(
    wrapper.props().searchGroup
  ).toBe(basicState.searchGroup)

  expect(wrapper).toMatchSnapshot()
})

test("mapDispatchToProps maps function performSearch", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {}, "searchGroup")

  mappedProps.performSearch("query", "searchProjects")
  expect(dispatch).toBeCalled()
  expect(performSearch).toBeCalledWith("searchGroup", "query", "searchProjects")
  expect(mappedProps).toMatchSnapshot()
})

test("moving the map doesn't signal challenges updates if not filtering on map bounds", () => {
  const wrapper = shallow(
    <WrappedChallengesComponent {...basicState} />
  )


  const newState = _cloneDeep(basicState)
  newState.currentSearch.challenges.mapBounds = {bounds: [0,0,0,1]}

  wrapper.instance().componentDidUpdate(newState)

  expect(basicState.performSearch).not.toBeCalled()
})

test("moving the map does perform new search if filtering within map bounds", () => {
  basicState.searchFilters = {location: 'withinMapBounds'}
  const wrapper = shallow(
    <WrappedChallengesComponent {...basicState} />
  )

  const newState = _cloneDeep(basicState)
  newState.currentSearch.challenges.mapBounds = {bounds: [0,0,0,1]}

  const didNewSearch = wrapper.instance().componentDidUpdate(newState)

  //expect(didNewSearch).toBe(true)
})

test("changing filters performs new search", () => {
  const wrapper = shallow(
    <WrappedChallengesComponent {...basicState} />
  )

  const newState = {currentSearch: {challenges: {filters: {difficulty: 'easy'}}}}
  const didNewSearch = wrapper.instance().componentDidUpdate(newState)

  //expect(didNewSearch).toBe(true)
})
