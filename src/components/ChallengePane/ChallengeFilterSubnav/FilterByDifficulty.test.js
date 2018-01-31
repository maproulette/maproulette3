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
  challengeFilter: {
    difficulty: 1
  }
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)
  basicProps.setChallengeFilters = jest.fn()
  basicProps.removeChallengeFilters = jest.fn()
  basicProps.intl = {formatMessage: jest.fn()}
})

test("it renders with props as expected", () => {
  const wrapper = shallow(
    <FilterByDifficulty {...basicProps} />
  )

  expect(wrapper).toMatchSnapshot()
})
