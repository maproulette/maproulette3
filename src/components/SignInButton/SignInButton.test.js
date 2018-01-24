import React from 'react'
import { SignInButton } from './SignInButton'

let basicProps = null

beforeEach(() => {
  basicProps = {
    history: {
      location: {
        pathname: '/some/path'
      }
    }
  }
})

test('render with an oauth link referring back to current path', () => {
  const wrapper = shallow(
    <SignInButton {...basicProps} />
  )

  expect(wrapper.hasClass('is-loading')).toBe(false)
  expect(wrapper.find('a').exists()).toBe(true)
  expect(wrapper.find('a').prop('href')).toMatch(basicProps.history.location.pathname)

  expect(wrapper).toMatchSnapshot()
})

test('shows busy if user login status still being confirmed', () => {
  basicProps.checkingLoginStatus = true

  const wrapper = shallow(
    <SignInButton {...basicProps} />
  )

  expect(wrapper.hasClass('is-loading')).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test('shows busy if user clicks the signin button', () => {
  const wrapper = shallow(
    <SignInButton {...basicProps} />
  )

  expect(wrapper.hasClass('is-loading')).toBe(false)
  wrapper.find('a').simulate('click')
  expect(wrapper.hasClass('is-loading')).toBe(true)

  expect(wrapper).toMatchSnapshot()
})
