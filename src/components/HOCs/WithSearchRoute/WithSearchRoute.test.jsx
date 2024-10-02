import {
        executeRouteSearch } from './WithSearchRoute'

import { WithSearchRoute } from './WithSearchRoute'

let basicProps = {}

beforeEach(() => {
  basicProps.setSearch = jest.fn()
  basicProps.setChallengeSearchMapBounds = jest.fn()
  basicProps.setSearchFilters = jest.fn()
  basicProps.setSearchSort = jest.fn()
  basicProps.setKeywordFilter = jest.fn()
  basicProps.clearSearchDispatch = jest.fn()
  basicProps.clearSearchFilters = jest.fn()
  basicProps.clearMapBounds = jest.fn()
})

test("executeRouteSearch clears old redux values first", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?query=test"}}
 
  shallow(
    <WrappedComponent {...basicProps} />
  )
  expect(basicProps.clearSearchFilters).toHaveBeenCalled()
  expect(basicProps.clearMapBounds).toHaveBeenCalled()
  expect(basicProps.clearSearchDispatch).toHaveBeenCalled()
})

test("executeRouteSearch executes setSearch when passed query=", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?query=test"}}

  shallow(
    <WrappedComponent {...basicProps} />
  )
  expect(basicProps.setSearch).toHaveBeenCalledWith("test")
})


test("executeRouteSearch executes setSearchSort when passed sort=", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?sort=name"}}

  shallow(
    <WrappedComponent {...basicProps} />
  )
  expect(basicProps.setSearchSort).toHaveBeenCalledWith({"sortBy": "name"})
})

test("executeRouteSearch executes setSearchFilters when passed difficulty=", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?difficulty=1"}}

  shallow(
    <WrappedComponent {...basicProps} />
  )
  expect(basicProps.setSearchFilters).toHaveBeenCalledWith({difficulty:1})
})


test("executeRouteSearch executes setKeywordFilter when passed keywords=", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?keywords=water,road"}}

  shallow(
    <WrappedComponent {...basicProps} />
  )
  expect(basicProps.setKeywordFilter).toHaveBeenCalledWith(["water", "road"])
})

test("executeRouteSearch executes setSearchFilters when passed location=", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?location=in-bounds"}}

  shallow(
    <WrappedComponent {...basicProps} />
  )
  expect(basicProps.setSearchFilters).toHaveBeenCalledWith({location: "in-bounds"})
})

test("executeRouteSearch executes setChallengeSearchMapBounds when passed challengeSearch=", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?challengeSearch=1,2,3,4"}}

  shallow(
    <WrappedComponent {...basicProps} />
  )
  expect(basicProps.setChallengeSearchMapBounds).toHaveBeenCalledWith(
    {"_northEast": {"lat": 4, "lng": 3}, "_southWest": {"lat": 2, "lng": 1}}, true)
})

test("executeRouteSearch executes a the given function for the correct key", () => {
  const routeCriteria = {myKey: jest.fn()}
  executeRouteSearch(routeCriteria, "?myKey=test")
  expect(routeCriteria.myKey).toHaveBeenCalledWith("test")
})
