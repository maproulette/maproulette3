import React, { Component } from 'react'
import _isFunction from 'lodash/isFunction'
import { _WithSearchExecution, mapDispatchToProps }
       from './WithSearchExecution'
import { performSearch } from '../../../services/Search/Search'

jest.mock('../../../services/Search/Search')

let basicState = null
let WrappedComponent = null

beforeEach(() => {
  basicState = {
    searchQueries: {
      searchName: "my search"
    }
  }

  WrappedComponent = _WithSearchExecution(
    () => <div className="child" />,
    "searchName",
    () => "my function"
  )
})

test("searchQueries.searchName is passed through to the wrapped component", () => {
  const wrapper = shallow(
    <WrappedComponent {...basicState} />
  )

  expect(
    wrapper.props().searchQueries.searchName
  ).toBe(basicState.searchQueries.searchName)

  expect(wrapper).toMatchSnapshot()
})

test("fetchResults function is passed through to the wrapped component", () => {
  const myPerformSearch = jest.fn()
  const wrapper = shallow(
    <WrappedComponent {...basicState} performSearch={myPerformSearch} />
  )

  expect(_isFunction(wrapper.props().fetchResults)).toBe(true)
})

test("mapDispatchToProps maps function performSearch", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  mappedProps.performSearch("searchName", "query", "searchProjects")
  expect(dispatch).toBeCalled()
  expect(performSearch).toBeCalledWith("searchName", "query", "searchProjects")
  expect(mappedProps).toMatchSnapshot()
})
