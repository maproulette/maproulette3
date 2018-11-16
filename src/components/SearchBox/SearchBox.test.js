import React from 'react'
import SearchBox from './SearchBox'

const propsFixture = {
}

let basicProps = null

beforeEach(() => {
  basicProps = Object.assign({}, propsFixture)
  basicProps.setSearch = jest.fn()
  basicProps.clearSearch = jest.fn()
  basicProps.fetchResults = jest.fn()
  basicProps.deactivate = jest.fn()
  basicProps.searchQuery = {query: ""}
})

test("shows a clear button if there is a query in the search box", () => {
  basicProps.searchQuery.query = 'test me'
  const wrapper = shallow(
    <SearchBox {...basicProps} />
  )

  expect(wrapper.find('.search-box--clear-button').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("shows a done button if showDoneButton is true and there is a query string", () => {
  basicProps.searchQuery.query = 'test Me'
  const wrapper = shallow(
    <SearchBox {...basicProps} showDoneButton />
  )

  expect(wrapper.find('.search-box--done-button').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})


test("does not show a done button if empty query string", () => {
  const wrapper = shallow(
    <SearchBox {...basicProps} />
  )

  expect(wrapper.find('.search-box--done-button').exists()).toBe(false)
  expect(wrapper).toMatchSnapshot()
})


test("does not show a done button if showDoneButton is false even if there is a query string", () => {
  basicProps.searchQuery.query = 'test me'
  const wrapper = shallow(
    <SearchBox {...basicProps}
               showDoneButton={false} />
  )

  expect(wrapper.find('.search-box--done-button').exists()).toBe(false)
  expect(wrapper).toMatchSnapshot()
})

test("deactivate function called when search icon clicked", () => {
  basicProps.searchQuery.query = "some query"
  const wrapper = shallow(
    <SearchBox {...basicProps} showDoneButton />
  )

  wrapper.find('.search-box--done-button').simulate('click')
  expect(basicProps.deactivate).toHaveBeenCalled()
  expect(wrapper).toMatchSnapshot()
})

test("does show a search icon when suppressIcon is false", () => {
  const wrapper = shallow(
    <SearchBox {...basicProps}
               suppressIcon={false} />
  )

  expect(wrapper.find('.search-box__icon').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})


test("does not show a search icon if suppressIcon is true", () => {
  const wrapper = shallow(
    <SearchBox {...basicProps}
               suppressIcon={true} />
  )

  expect(wrapper.find('.search-box__icon').exists()).toBe(false)
  expect(wrapper).toMatchSnapshot()
})

test("is-loading class not present normally", () => {
  const wrapper = shallow(
    <SearchBox {...basicProps} />
  )

  expect(wrapper.find('.is-loading').exists()).toBe(false)
  expect(wrapper).toMatchSnapshot()
})


test("is-loading class added when searchQuery.fetchingResults", () => {
  basicProps.searchQuery.query = 'test me'
  basicProps.searchQuery.meta = {fetchingResults: 'myFetchId'}

  const wrapper = shallow(
    <SearchBox {...basicProps} />
  )

  expect(wrapper.find('.is-loading').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("placeholder props is inserted into text box", () => {
  const wrapper = shallow(
    <SearchBox {...basicProps} placeholder={'some text here'}/>
  )

  expect(wrapper.find('.search-box__input').getElement().props.placeholder).toBe('some text here')
  expect(wrapper).toMatchSnapshot()
})

test("setSearch called when the query in box is changed", () => {
  const wrapper = shallow(
    <SearchBox {...basicProps} />
  )

  wrapper.find('.search-box__input').simulate('change', { target: { value: 'Hello' } })
  expect(basicProps.setSearch).toHaveBeenCalled()
  expect(wrapper).toMatchSnapshot()
})

test("clearSearch called when the clear button is pressed", () => {
  basicProps.searchQuery.query = 'test me'
  const wrapper = shallow(
    <SearchBox {...basicProps} />
  )

  wrapper.find('.search-box--clear-button').simulate('click')
  expect(basicProps.clearSearch).toHaveBeenCalled()
  expect(wrapper).toMatchSnapshot()
})

test("clearSearch is called when escape is pressed", () => {
  const wrapper = shallow(
    <SearchBox {...basicProps} />
  )

  wrapper.find('.search-box__input').simulate('keydown', {key: 'Escape'})
  expect(basicProps.clearSearch).toHaveBeenCalled()
  expect(wrapper).toMatchSnapshot()
})

test("deactivate is called when escape is pressed", () => {
  const wrapper = shallow(
    <SearchBox {...basicProps} />
  )

  wrapper.find('.search-box__input').simulate('keydown', {key: 'Enter'})
  expect(basicProps.deactivate).toHaveBeenCalled()
  expect(wrapper).toMatchSnapshot()
})

test("classNames are included on the wrapper element", () => {
  const wrapper = shallow(
    <SearchBox {...basicProps} className='my-class'/>
  )

  expect(wrapper.find('.my-class').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})
