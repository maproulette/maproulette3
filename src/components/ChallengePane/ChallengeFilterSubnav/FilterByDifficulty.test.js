import React from 'react'
import { FilterByDifficulty } from './FilterByDifficulty'
import _cloneDeep from 'lodash/cloneDeep'

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
  }
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)
  basicProps.setSearchFilters = jest.fn()
  basicProps.removeSearchFilters = jest.fn()
  basicProps.intl = {formatMessage: jest.fn(m => m.defaultMessage)}
})

test("it renders with props as expected", () => {
  const wrapper = shallow(
    <FilterByDifficulty {...basicProps} />
  )

  expect(wrapper).toMatchSnapshot()
})

test("it calls setSearchFilters if an onChange occurs with a value", () => {
  const wrapper = shallow(
    <FilterByDifficulty {...basicProps} />
  )

  wrapper.instance().updateFilter({value: 'hard'})
  expect(basicProps.setSearchFilters).toBeCalledWith({"difficulty": "hard"})
})

test("it calls removeSearchFilters if an onChange occurs with a null value", () => {
  const wrapper = shallow(
    <FilterByDifficulty {...basicProps} />
  )

  wrapper.instance().updateFilter({value: null})
  expect(basicProps.removeSearchFilters).toBeCalledWith(['difficulty'])
})
