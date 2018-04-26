import React from 'react'
import { VisibilitySwitch } from './VisibilitySwitch'

let basicProps = null

beforeEach(() => {
  basicProps = {
    challenge: {
      id: 123,
      enabled: false,
    },
    updateEnabled: jest.fn(),
  }
})

test("shows visibility switch", () => {
  const wrapper = shallow(
    <VisibilitySwitch {...basicProps} />
  )

  expect(wrapper.find('.visibility-switch').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("switch state is off when challenge not enabled", () => {
  const wrapper = shallow(
    <VisibilitySwitch {...basicProps} />
  )

  expect(
    wrapper.find('.visibility-switch input[checked=false]').exists()
  ).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("switch state is on when challenge is enabled", () => {
  basicProps.challenge.enabled = true

  const wrapper = shallow(
    <VisibilitySwitch {...basicProps} />
  )

  expect(
    wrapper.find('.visibility-switch input[checked=true]').exists()
  ).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("clicking the switch for disabled challenge signals enable", () => {
  const wrapper = shallow(
    <VisibilitySwitch {...basicProps} />
  )

  wrapper.find('.visibility-switch').simulate('click')

  expect(basicProps.updateEnabled).toBeCalledWith(basicProps.challenge.id, true)
})

test("clicking the switch for enabled challenge signals disable", () => {
  basicProps.challenge.enabled = true

  const wrapper = shallow(
    <VisibilitySwitch {...basicProps} />
  )

  wrapper.find('.visibility-switch').simulate('click')

  expect(basicProps.updateEnabled).toBeCalledWith(basicProps.challenge.id, false)
})
