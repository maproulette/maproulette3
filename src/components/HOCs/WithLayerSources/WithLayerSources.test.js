import React, { Component } from 'react'
import WithLayerSources from './WithLayerSources'
import { LayerSources } from '../../../services/VisibleLayer/LayerSources'

let WrappedComponent = null

beforeEach(() => {
  WrappedComponent = WithLayerSources(() => <div className="child-control" />)
})

test("the wrapped component is rendered", () => {
  const wrapper = shallow(
    <WrappedComponent />
  )

  expect(wrapper).toMatchSnapshot()
})

test("layer sources are made available to the wrapped component", () => {
  const wrapper = shallow(
    <WrappedComponent />
  )

  expect(wrapper.props().layerSources).toEqual(LayerSources)
})
