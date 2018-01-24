import React from 'react'
import SavedChallenges from './SavedChallenges'

let basicProps = null

beforeEach(() => {
  basicProps = {
    user: {
      savedChallenges: [
        {
          id: 321,
          name: "First Challenge",
        },
        {
          id: 654,
          name: "Second Challenge"
        },
        {
          id: 987,
          name: "Third Challenge"
        },
      ]
    },
    intl: {
      formatMessage: jest.fn(),
    }
  }
})

test('it renders a list of the saved challenges with links to each', () => {
  const wrapper = shallow(
    <SavedChallenges {...basicProps} />
  )

  expect(wrapper.find('li').length).toBe(basicProps.user.savedChallenges.length)

  // Make sure each challenge is represented in the list
  basicProps.user.savedChallenges.forEach(challenge =>
    expect(wrapper.find('Link').findWhere(link =>
      new RegExp(challenge.id).test(link.prop('to'))
    ).exists()).toBe(true)
  )

  expect(wrapper).toMatchSnapshot()
})

test('it renders a div with class none if there are no saved challenges', () => {
  basicProps.user.savedChallenges= []

  const wrapper = shallow(
    <SavedChallenges {...basicProps} />
  )

  expect(wrapper.find('li').length).toBe(0)
  expect(wrapper.find('.none').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

