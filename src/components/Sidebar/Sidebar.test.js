import React from 'react'
import Sidebar from './Sidebar'

test('it renders children when active', () => {
  const wrapper = shallow(
    <Sidebar isActive>foo</Sidebar>
  )

  expect(wrapper.find('.sidebar__content').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test('it does not render children when not active', () => {
  const wrapper = shallow(
    <Sidebar isActive={false}>foo</Sidebar>
  )

  expect(wrapper.find('sidebar__content').exists()).toBe(false)
  expect(wrapper).toMatchSnapshot()
})

test('it includes an is-active CSS class when active', () => {
  const wrapper = shallow(
    <Sidebar isActive />
  )

  expect(wrapper.hasClass('is-active')).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test('it does not include an is-active CSS class when not active', () => {
  const wrapper = shallow(
    <Sidebar isActive={false} />
  )

  expect(wrapper.hasClass('is-active')).toBe(false)
  expect(wrapper).toMatchSnapshot()
})

test('it includes a close control if an onClose prop is given', () => {
  const wrapper = shallow(
    <Sidebar onClose={jest.fn()} />
  )

  expect(wrapper.find('.sidebar__close').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test('clicking the close control invokes the onClose prop', () => {
  const onClose = jest.fn()

  const wrapper = shallow(
    <Sidebar onClose={onClose} />
  )

  wrapper.find('.sidebar__close').simulate('click')
  expect(onClose.mock.calls.length).toBe(1)
})

test('it does not include a close control if an onClose prop is not given', () => {
  const wrapper = shallow(
    <Sidebar />
  )

  expect(wrapper.find('.sidebar__close').exists()).toBe(false)
  expect(wrapper).toMatchSnapshot()
})

test('it includes a minimize toggle if a toggleMinimized prop is given', () => {
  const wrapper = shallow(
    <Sidebar toggleMinimized={jest.fn()} />
  )

  expect(wrapper.find('.sidebar--minimizer').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test('clicking the minimize toggle invokes the toggleMinimized prop', () => {
  const toggleMinimized = jest.fn()

  const wrapper = shallow(
    <Sidebar toggleMinimized={toggleMinimized} />
  )

  wrapper.find('.sidebar--minimizer .toggle-minimization').simulate('click')
  expect(toggleMinimized.mock.calls.length).toBe(1)
})

test('it does not include a minimize toggle if a toggleMinimized prop is not given', () => {
  const wrapper = shallow(
    <Sidebar />
  )

  expect(wrapper.find('.sidebar--minimizer').exists()).toBe(false)
  expect(wrapper).toMatchSnapshot()
})
