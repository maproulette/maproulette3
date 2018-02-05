import React from 'react'
import ConfirmAction from './ConfirmAction'

let childAction = null
let childControl = null

beforeEach(() => {
  childAction = jest.fn()

  childControl =
    <a className="child-control" onClick={childAction}>Child Control</a>
})

test("shows confirmation-wrapper with child control", () => {
  const wrapper = shallow(
    <ConfirmAction>{childControl}</ConfirmAction>
  )

  expect(wrapper.find('.confirm-action').exists()).toBe(true)
  expect(wrapper.find('.confirm-action__modal[isActive=false]').exists()).toBe(true)
  expect(wrapper.find('.child-control').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})


test("clicking the child control displays confirmation modal", () => {
  const wrapper = shallow(
    <ConfirmAction>{childControl}</ConfirmAction>
  )

  wrapper.find('.child-control').simulate('click')
  wrapper.update()

  expect(wrapper.find('.confirm-action__modal[isActive=true]').exists()).toBe(true)
  expect(childAction).not.toHaveBeenCalled()

  expect(wrapper).toMatchSnapshot()
})

test("clicking Cancel on the modal simply hides it again", () => {
  const wrapper = shallow(
    <ConfirmAction>{childControl}</ConfirmAction>
  )

  wrapper.find('.child-control').simulate('click')
  wrapper.update()

  wrapper.find('.confirm-action__cancel-control').simulate('click')
  wrapper.update()

  expect(wrapper.find('.confirm-action__modal[isActive=false]').exists()).toBe(true)
  expect(childAction).not.toHaveBeenCalled()

  expect(wrapper).toMatchSnapshot()
})

test("clicking Proceed on the modal executes the child action and hides the modal", () => {
  const wrapper = shallow(
    <ConfirmAction>{childControl}</ConfirmAction>
  )

  wrapper.find('.child-control').simulate('click')
  wrapper.update()

  wrapper.find('.confirm-action__proceed-control').simulate('click')
  wrapper.update()

  expect(childAction).toHaveBeenCalled()
  expect(wrapper.find('.confirm-action__modal[isActive=false]').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})
