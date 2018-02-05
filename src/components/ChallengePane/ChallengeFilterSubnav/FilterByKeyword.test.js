import React from 'react'
import { FilterByKeyword } from './FilterByKeyword'
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
    difficulty: 1,
    keywords: 'Challenge'
  }
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)
  basicProps.setKeywordFilter = jest.fn()
  basicProps.removeChallengeFilters = jest.fn()
  basicProps.intl = {formatMessage: jest.fn()}
})

test("it renders with props as expected", () => {
  const wrapper = shallow(
    <FilterByKeyword {...basicProps} />
  )

  expect(wrapper).toMatchSnapshot()
})

test("it calls setKeywordFilter if an onChange occurs with a value", () => {
  const wrapper = mount(
    <FilterByKeyword {...basicProps} />
  )

  wrapper.instance().updateFilter({value: 'water'})
  expect(basicProps.setKeywordFilter).toBeCalledWith(["natural", "water"])
})

test("it calls removeChallengeFilters if an onChange occurs with a null value", () => {
  const wrapper = mount(
    <FilterByKeyword {...basicProps} />
  )

  wrapper.instance().updateFilter({value: null})
  expect(basicProps.removeChallengeFilters).toBeCalledWith(['keywords'])
})
