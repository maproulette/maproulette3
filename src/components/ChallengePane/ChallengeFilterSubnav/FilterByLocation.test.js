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
  challengeFilter: {
    difficulty: 1
  },
  mapBounds: {
    locator: {bounds: 1}
  },
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)
  basicProps.setChallengeFilters = jest.fn()
  basicProps.removeChallengeFilters = jest.fn()
  basicProps.locateMapToUser = jest.fn()
  basicProps.updateBoundedChallenges = jest.fn()
  basicProps.intl = {formatMessage: jest.fn()}
})

test("it renders with props as expected", () => {
  const wrapper = shallow(
    <FilterByLocation {...basicProps} />
  )

  expect(wrapper).toMatchSnapshot()
})

test("it calls setChallengeFilters/locateMapToUser if an onChange occurs with 'nearMe'", () => {
  const wrapper = mount(
    <FilterByLocation {...basicProps} />
  )

  wrapper.instance().updateFilter({value: 'nearMe'})
  expect(basicProps.setChallengeFilters).toBeCalledWith({"location": "withinMapBounds"})
  expect(basicProps.locateMapToUser).toBeCalledWith({"id": 11, "savedChallenges": []})
})


test("it calls setChallengeFilters/updateBoundedChallenges if an onChange occurs with withinMapBounds", () => {
  const wrapper = mount(
    <FilterByLocation {...basicProps} />
  )

  wrapper.instance().updateFilter({value: 'withinMapBounds'})
  expect(basicProps.setChallengeFilters).toBeCalledWith({"location": "withinMapBounds"})
  expect(basicProps.updateBoundedChallenges).toBeCalledWith(1)
})

test("it calls removeChallengeFilters if an onChange occurs with a null value", () => {
  const wrapper = mount(
    <FilterByLocation {...basicProps} />
  )

  wrapper.instance().updateFilter({value: null})
  expect(basicProps.removeChallengeFilters).toBeCalledWith(['location'])
})
