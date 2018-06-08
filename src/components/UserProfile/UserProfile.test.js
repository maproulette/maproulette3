import React from 'react'
import { UserProfile } from './UserProfile'

let basicProps = null
let createdDate = Date.UTC(2017, 1, 23)

beforeEach(() => {
  basicProps = {
    user: {
      id: 357,
      isLoggedIn: true,
      created: createdDate,
      osmProfile: {
        avatarURL: "some/url"
      }
    },
    intl: {formatMessage: jest.fn(m => m.defaultMessage)},
    resetAPIKey: () => null,
  }
})

test('it just shows a sign-in option if the user is not logged in', () => {
  basicProps.user.isLoggedIn = false

  const wrapper = shallow(
    <UserProfile {...basicProps} />
  )

  expect(wrapper.find('.user-profile--signin').exists()).toBe(true)
  expect(wrapper.find('.user-profile__personal').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test('it shows user profile data if the user is logged in', () => {
  const wrapper = shallow(
    <UserProfile {...basicProps} />
  )

  expect(wrapper.find('PersonalInfo').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})
