import React, { Component } from 'react'
import { _WithSearchQuery,
         mapStateToProps,
         mapDispatchToProps } from './WithSearchQuery'
import { setSearch, clearSearch } from '../../../services/Search/Search'

jest.mock('../../../services/Search/Search')

let basicState = null
let WrappedComponent = null

beforeEach(() => {
  basicState = {
    currentSearch: {
      searchQueryTest: "searchQueryValue",
    },
  }

  WrappedComponent = _WithSearchQuery(
    () => <div className="child" />,
    "searchQueryTest"
  )
})

test("searchQueries are passed through to the wrapped component", () => {
  const wrapper = shallow(
    <WrappedComponent {...basicState} />
  )

  expect(
    wrapper.props().searchQueries.searchQueryTest.searchQuery
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
  const mappedProps = mapDispatchToProps(dispatch, {})

  mappedProps.setSearch("query", "searchName")
  expect(dispatch).toBeCalled()
  expect(setSearch).toBeCalledWith("searchName", "query")

  expect(mappedProps).toMatchSnapshot()
})

test("mapDispatchToProps maps function clearSearch", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  mappedProps.clearSearch("searchName")
  expect(dispatch).toBeCalled()
  expect(clearSearch).toBeCalledWith("searchName")
})
