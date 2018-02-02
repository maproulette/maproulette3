import React from 'react'
import PlaceDescription from './PlaceDescription'
import _cloneDeep from 'lodash/cloneDeep'

const propsFixture = {
  place: {
    address: {
      city: "My City",
      county: "Orange",
      state: "Washington",
      country: "USA"
    }
  },
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)
})

test("renders with props as expected", () => {
  const wrapper = shallow(
    <PlaceDescription {...basicProps} />
  )

  expect(wrapper.find('.place-description').getElement().props.children).toBe(
    'My City, Orange County, Washington, USA'
  )

  expect(wrapper).toMatchSnapshot()
})

test("does not explode with null place", () => {
  const wrapper = shallow(
    <PlaceDescription />
  )

  expect(wrapper).toMatchSnapshot()
})

test("renders with props className in encapsulating div", () => {
  const wrapper = shallow(
    <PlaceDescription {...basicProps} className="my-test"/>
  )

  expect(wrapper.find('.my-test').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("if county is in description, does not render word 'county'", () => {
  basicProps.place.address.county = 'Long Beach County'
  const wrapper = shallow(
    <PlaceDescription {...basicProps} />
  )

  expect(wrapper.find('.place-description').getElement().props.children).toBe(
    'My City, Long Beach County, Washington, USA'
  )
  expect(wrapper).toMatchSnapshot()
})

test("renders town if no city", () => {
  basicProps.place.address.city = null
  basicProps.place.address.town = "Our Town"

  const wrapper = shallow(
    <PlaceDescription {...basicProps} />
  )

  expect(wrapper.find('.place-description').getElement().props.children).toBe(
    'Our Town, Orange County, Washington, USA'
  )
  expect(wrapper).toMatchSnapshot()
})

test("renders hamlet if no town and no city", () => {
  basicProps.place.address.city = null
  basicProps.place.address.hamlet = "The Shire"

  const wrapper = shallow(
    <PlaceDescription {...basicProps} />
  )

  expect(wrapper.find('.place-description').getElement().props.children).toBe(
    'The Shire, Orange County, Washington, USA'
  )
  expect(wrapper).toMatchSnapshot()
})

test("renders village if no hamlet, no town and no city", () => {
  basicProps.place.address.city = null
  basicProps.place.address.village = "Village Square"

  const wrapper = shallow(
    <PlaceDescription {...basicProps} />
  )

  expect(wrapper.find('.place-description').getElement().props.children).toBe(
    'Village Square, Orange County, Washington, USA'
  )
  expect(wrapper).toMatchSnapshot()
})

test("renders continent if no country", () => {
  basicProps.place.address.country = null
  basicProps.place.address.continent = "Africa"

  const wrapper = shallow(
    <PlaceDescription {...basicProps} />
  )

  expect(wrapper.find('.place-description').getElement().props.children).toBe(
    'My City, Orange County, Washington, Africa'
  )
  expect(wrapper).toMatchSnapshot()
})
