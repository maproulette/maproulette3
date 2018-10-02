import React, { Component } from 'react'
import { WithSearchResults } from './WithSearchResults'

let basicProps = null
let WrappedComponent = null

beforeEach(() => {
  basicProps = {
    searchCriteria: {
      query: ""
    },
    myItems: [
      {
        name: "first item",
        tags: ["foo"]
      },
      {
        name: "second item"
      },
      {
        name: "third item",
        tags: ["bar", "baz"]
      }
    ]
  }

  WrappedComponent = WithSearchResults(
    () => <div className="child" />,
    "mySearchName",
    "myItems"
  )
})

test("Search query is passed to wrapped component", () => {
  const wrapper = shallow(
    <WrappedComponent {...basicProps} />
  )

  expect(wrapper.props().searchCriteria.query).toBe("")
  expect(wrapper.props().myItems.length).toBe(basicProps.myItems.length)

  expect(wrapper).toMatchSnapshot()
})

test("Search Results with tags are passed first in search results", () => {
  basicProps.searchCriteria.query = "#bar"

  const wrapper = shallow(
    <WrappedComponent {...basicProps} />
  )

  expect(wrapper.props().myItems[0].name).toBe('third item')
  expect(wrapper.props().myItems[0].tags[0]).toBe('bar')
  expect(wrapper).toMatchSnapshot()
})

test("Search Results are passed back as the 'outputProp' if provided", () => {
  WrappedComponent = WithSearchResults(
    () => <div className="child" />,
    "mySearchName",
    "myItems",
    "myOutput"
  )

  const wrapper = shallow(
    <WrappedComponent {...basicProps} />
  )

  expect(wrapper.props().myOutput.length).toBe(basicProps.myItems.length)
  expect(wrapper).toMatchSnapshot()
})
