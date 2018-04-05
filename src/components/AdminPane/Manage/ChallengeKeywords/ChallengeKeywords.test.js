import React from 'react'
import ChallengeKeywords from './ChallengeKeywords'

let basicProps = null

beforeEach(() => {
  basicProps = {
    challenge: {
      id: 123,
      tags: ["foo", "bar", "baz"],
    }
  }
})

test("renders the challenge tags", () => {
  const wrapper = shallow(
    <ChallengeKeywords {...basicProps} />
  )

  expect(
    wrapper.find('.challenge-keywords .tag').length
  ).toBe(basicProps.challenge.tags.length)

  expect(wrapper).toMatchSnapshot()
})
