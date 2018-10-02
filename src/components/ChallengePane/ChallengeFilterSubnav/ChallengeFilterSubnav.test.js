import React from 'react'
import { ChallengeFilterSubnav } from './ChallengeFilterSubnav'
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
  setSearch: jest.fn(),
  clearSearch: jest.fn(),
}

let basicProps = null

beforeEach(() => {
  basicProps = _cloneDeep(propsFixture)
  basicProps.intl = {formatMessage: jest.fn()}
})

test("renders with props as expected", () => {
  const wrapper = shallow(
    <ChallengeFilterSubnav {...basicProps} />
  )

  expect(wrapper.find('.challenge-filter-subnav').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})
