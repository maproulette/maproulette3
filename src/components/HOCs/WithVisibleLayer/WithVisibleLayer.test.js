import React, { Component } from 'react'
import { mapStateToProps, mapDispatchToProps } from './WithVisibleLayer'
import { layerSourceWithName,
         defaultLayerSource } from '../../../services/VisibleLayer/LayerSources'
import { changeVisibleLayer } from '../../../services/VisibleLayer/VisibleLayer'

jest.mock('../../../services/VisibleLayer/LayerSources')
jest.mock('../../../services/VisibleLayer/VisibleLayer')

layerSourceWithName.mockImplementation((layer) => layer)

let basicState = null

beforeEach(() => {
  basicState = {}
})

test("mapStateToProps maps source to visibleLayer from state, if any", () => {
  basicState = {visibleLayer: "layer1"}
  const mappedProps = mapStateToProps(basicState, {defaultLayer: "layer2"})
  expect(mappedProps.source).toEqual(basicState.visibleLayer)

  expect(mappedProps).toMatchSnapshot()
})

test("mapStateToProps source uses given default layer if no visible layer in state", () => {
  const mappedProps = mapStateToProps({}, {defaultLayer: "layer2"})
  expect(mappedProps.source).toEqual("layer2")

  expect(mappedProps).toMatchSnapshot()
})

test("mapStateToProps source uses call to defaultLayerSource() if neither default layer nor visible layer is available", () => {
  const mappedProps = mapStateToProps({}, {})

  expect(defaultLayerSource).toBeCalled()

  expect(mappedProps).toMatchSnapshot()
})

test("mapDispatchToProps maps function changeLayer", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  mappedProps.changeLayer("myLayer")
  expect(dispatch).toBeCalled()
  expect(changeVisibleLayer).toBeCalledWith("myLayer")
})
