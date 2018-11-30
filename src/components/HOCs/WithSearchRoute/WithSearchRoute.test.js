import React, { Component } from 'react'
import { addSearchCriteriaToRoute,
         addBoundsToRoute, removeSearchCriteriaFromRoute,
        executeRouteSearch } from './WithSearchRoute'
import { toLatLngBounds, fromLatLngBounds }
      from '../../../services/MapBounds/MapBounds'
import { WithSearchRoute } from './WithSearchRoute'

let basicProps = {}

beforeEach(() => {
  basicProps.setSearch = jest.fn()
  basicProps.setChallengeSearchMapBounds = jest.fn()
  basicProps.setSearchFilters = jest.fn()
  basicProps.setSearchSort = jest.fn()
  basicProps.setKeywordFilter = jest.fn()
  basicProps.clearSearch = jest.fn()
  basicProps.clearSearchFilters = jest.fn()
  basicProps.clearMapBounds = jest.fn()
})

test("executeRouteSearch clears old redux values first", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?query=test"}}

  const wrapper = shallow(
    <WrappedComponent {...basicProps} />
  )
  expect(basicProps.clearSearchFilters).toHaveBeenCalled()
  expect(basicProps.clearMapBounds).toHaveBeenCalled()
  expect(basicProps.clearSearch).toHaveBeenCalled()
})

test("executeRouteSearch executes setSearch when passed query=", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?query=test"}}

  const wrapper = shallow(
    <WrappedComponent {...basicProps} />
  )
  expect(basicProps.setSearch).toHaveBeenCalledWith("test")
})


test("executeRouteSearch executes setSearchSort when passed sort=", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?sort=name"}}

  const wrapper = shallow(
    <WrappedComponent {...basicProps} />
  )
  expect(basicProps.setSearchSort).toHaveBeenCalledWith({"sortBy": "name"})
})

test("executeRouteSearch executes setSearchFilters when passed difficulty=", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?difficulty=1"}}

  const wrapper = shallow(
    <WrappedComponent {...basicProps} />
  )
  expect(basicProps.setSearchFilters).toHaveBeenCalledWith({difficulty:1})
})


test("executeRouteSearch executes setKeywordFilter when passed keywords=", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?keywords=water,road"}}

  const wrapper = shallow(
    <WrappedComponent {...basicProps} />
  )
  expect(basicProps.setKeywordFilter).toHaveBeenCalledWith(["water", "road"])
})

test("executeRouteSearch executes setSearchFilters when passed location=", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?location=in-bounds"}}

  const wrapper = shallow(
    <WrappedComponent {...basicProps} />
  )
  expect(basicProps.setSearchFilters).toHaveBeenCalledWith({location: "in-bounds"})
})

test("executeRouteSearch executes setChallengeSearchMapBounds when passed challengeSearch=", () => {
  const WrappedComponent = WithSearchRoute(() => <div className="child" />, "challenges")
  basicProps.history = {location: {search: "?challengeSearch=1,2,3,4"}}

  const wrapper = shallow(
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

test("addSearchCriteriaToRoute will add the given criteria to the query route", () => {
  const history = {location: {search: "", pathname: "http:mytest"}, replace: jest.fn()}

  addSearchCriteriaToRoute(history, {x: "y"})
  expect(history.replace).toBeCalledWith("http:mytest?x=y")
})

test("addSearchCriteriaToRoute will add more than one given criteria to the query route", () => {
  const history = {location: {search: "", pathname: "http:mytest"}, replace: jest.fn()}

  addSearchCriteriaToRoute(history, {x: "y", z: "444"})
  expect(history.replace).toBeCalledWith("http:mytest?x=y&z=444")
})

test("addSearchCriteriaToRoute will preserve existing criteria on the route", () => {
  const history = {location: {search: "?name=map&go=true", pathname: "http:mytest"}, replace: jest.fn()}

  addSearchCriteriaToRoute(history, {x: "y", z: "444"})
  expect(history.replace).toBeCalledWith("http:mytest?go=true&name=map&x=y&z=444")
})


test("addBoundsToRoute will add the LatLngBounds to the route", () => {
  const bounds = toLatLngBounds([1,2,3,4])
  const history = {location: {search: "?name=map&go=true", pathname: "http:mytest"}, replace: jest.fn()}

  addBoundsToRoute(history, "challengeSearch", bounds)
  expect(history.replace).toBeCalledWith("http:mytest?challengeSearch=1%2C2%2C3%2C4&go=true&name=map")
})

test("removeSearchCriteriaFromRoute will remove the criteria from the route", () => {
  const history = {location: {search: "?name=map&go=true", pathname: "http:mytest"}, replace: jest.fn()}

  removeSearchCriteriaFromRoute(history, ["go"])
  expect(history.replace).toBeCalledWith("http:mytest?name=map")
})

test("removeSearchCriteriaFromRoute will remove multiple criteria from the route", () => {
  const history = {location: {search: "?name=map&go=true", pathname: "http:mytest"}, replace: jest.fn()}

  removeSearchCriteriaFromRoute(history, ["go", "name"])
  expect(history.replace).toBeCalledWith("http:mytest?")
})

test("removeSearchCriteriaFromRoute is ok with null criteriaKeys", () => {
  const history = {location: {search: "?name=map&go=true", pathname: "http:mytest"}, replace: jest.fn()}

  removeSearchCriteriaFromRoute(history, null)
  expect(history.replace).toBeCalledWith("http:mytest?go=true&name=map")
})
