import React from 'react'
import SvgSymbol from './SvgSymbol'

test('it renders a reference to the given svg', () => {
  const wrapper = shallow(
    <SvgSymbol sym="foo" viewBox="0 0 20 20" />
  )

  expect(wrapper.find('use[xlinkHref="#foo"]').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test('it includes the given viewbox', () => {
  const wrapper = shallow(
    <SvgSymbol sym="foo" viewBox="0 0 20 20" />
  )

  expect(wrapper.find('svg[viewBox="0 0 20 20"]').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})
