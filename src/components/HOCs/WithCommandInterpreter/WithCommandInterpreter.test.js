import React, { Component } from 'react'
import _findIndex from 'lodash/findIndex'
import { executeCommand } from './WithCommandInterpreter'

let basicProps = {}

beforeEach(() => {
  basicProps.setSearch = jest.fn()
  basicProps.clearSearch = jest.fn()
  basicProps.setChallengeSearchMapBounds = jest.fn()
})


test("executeCommand recognizes s/", () => {
  //const wrapper = new (WithCommandInterpreter(<div />))

  executeCommand(basicProps, "s/hello world")
  expect(basicProps.setSearch).toHaveBeenCalledWith("hello world")
})

test("executeCommand recognizes m/ with 4 bounds", () => {
  //const wrapper = new (WithCommandInterpreter(<div />))

  executeCommand(basicProps, "m/1.1,2.2,3.3,4.4")
  expect(basicProps.setSearch).not.toHaveBeenCalled()
  expect(basicProps.setChallengeSearchMapBounds).toHaveBeenCalledWith([1.1, 2.2, 3.3, 4.4], 3, true)
})

test("executeCommand recognizes m/ with 2 bounds as centerpoint", () => {
  //const wrapper = new (WithCommandInterpreter(<div />))

  executeCommand(basicProps, "m/1,4")
  expect(basicProps.setSearch).not.toHaveBeenCalled()
  expect(basicProps.setChallengeSearchMapBounds).toHaveBeenCalledWith([0.625, 3.625, 1.375, 4.375], 3, true)
})
