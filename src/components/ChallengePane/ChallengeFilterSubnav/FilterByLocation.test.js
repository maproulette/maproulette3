import React from 'react'
import { FilterByLocation } from './FilterByLocation'
import { cloneDeep as _cloneDeep } from 'lodash'

const propsFixture = {
  user: {
    id: 11,
    savedChallenges: [],
  },
  challenges: [
    {
      id: 309,
      name: "Challenge 309",
      blurb: "Challenge 309 blurb",
      description: "Challenge 309 description",
      parent: {
        displayName: "foo",
      }
    },
    {
      id: 311,
      name: "Challenge 311",
      blurb: "Challenge 311 blurb",
      description: "Challenge 311 description",
      parent: {
        displayName: "bar",
      }
    }
  ],
  searchFilters: {
    difficulty: 1
  },
  mapBounds: {
    challenges: {bounds: 1}
  },
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)
  basicProps.setSearchFilters = jest.fn()
  basicProps.removeSearchFilters = jest.fn()
  basicProps.locateMapToUser = jest.fn()
  basicProps.intl = {formatMessage: jest.fn()}
})

test("it renders with props as expected", () => {
  const wrapper = shallow(
    <FilterByLocation {...basicProps} />
  )

  expect(wrapper).toMatchSnapshot()
})

test("it calls setSearchFilters/locateMapToUser if an onChange occurs with 'nearMe'", () => {
  const wrapper = shallow(
    <FilterByLocation {...basicProps} />
  )

  wrapper.instance().updateFilter({value: 'nearMe'})
  expect(basicProps.setSearchFilters).toBeCalledWith({"location": "withinMapBounds"})
  expect(basicProps.locateMapToUser).toBeCalledWith({"id": 11, "savedChallenges": []})
})


test("it calls setSearchFilters if an onChange occurs with withinMapBounds", () => {
  const wrapper = shallow(
    <FilterByLocation {...basicProps} />
  )

  wrapper.instance().updateFilter({value: 'withinMapBounds'})
  expect(basicProps.setSearchFilters).toBeCalledWith({"location": "withinMapBounds"})
})

test("it calls removeSearchFilters if an onChange occurs with a null value", () => {
  const wrapper = shallow(
    <FilterByLocation {...basicProps} />
  )

  wrapper.instance().updateFilter({value: null})
  expect(basicProps.removeSearchFilters).toBeCalledWith(['location'])
})
