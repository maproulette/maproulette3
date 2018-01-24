import React from 'react'
import Navbar from './Navbar'

let basicProps = null

beforeEach(() => {
  basicProps = {
    location: {
      pathname: '/some/path'
    },
    user: {
      id: 357,
      isLoggedIn: true,
    },
  }
})

test("does not show an admin link if user is not signed in", () => {
  basicProps.user.isLoggedIn = false

  const wrapper = shallow(
    <Navbar {...basicProps} />
  )

  expect(wrapper.find('Link').exists()).toBe(true)
  expect(wrapper.find('Link[to="admin"]').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})

test("includes an admin link if user is logged in", () => {
  const wrapper = shallow(
    <Navbar {...basicProps} />
  )

  expect(wrapper.find('Link[to="admin"]').exists()).toBe(false)

  expect(wrapper).toMatchSnapshot()
})
