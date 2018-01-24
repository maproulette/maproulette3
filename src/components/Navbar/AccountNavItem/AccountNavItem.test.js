import React from 'react'
import { AccountNavItem } from './AccountNavItem'

let basicProps = null

beforeEach(() => {
  basicProps = {
    logoutUser: jest.fn(),
    intl: {
      formatMessage: jest.fn(),
    },
    user: {
      id: 357,
      isLoggedIn: true,
      osmProfile: {
        avatarURL: "some/url"
      }
    }
  }
})

test("shows only a sign-in button if the user is not logged in", () => {
  basicProps.user.isLoggedIn = false

  const wrapper = shallow(
    <AccountNavItem {...basicProps} />
  )

  expect(wrapper.find('.navbar__account-nav-item__signin').exists()).toBe(true)
  expect(wrapper.find('.navbar__account-nav-item__dropdown').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("shows a dropdown menu if user is logged in", () => {
  const wrapper = shallow(
    <AccountNavItem {...basicProps} />
  )

  expect(wrapper.find('.navbar__account-nav-item__signin').exists()).toBe(false)
  expect(wrapper.find('.navbar__account-nav-item__dropdown').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})
