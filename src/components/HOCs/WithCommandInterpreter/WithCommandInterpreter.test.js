import React, { Component } from 'react'
import _findIndex from 'lodash/findIndex'
import { executeCommand, executeMapSearch } from './WithCommandInterpreter'
import { fetchPlaceLocation } from '../../../services/Place/Place'

jest.mock('../../../services/Place/Place')
fetchPlaceLocation.mockImplementation((query) => new Promise(() => {}))

let basicProps = {}

beforeEach(() => {
  basicProps.setSearch = jest.fn()
  basicProps.clearSearch = jest.fn()
  basicProps.updateChallengeSearchMapBounds = jest.fn()
})


test("executeCommand recognizes s/", () => {
  executeCommand(basicProps, "s/hello world", (loading) => {})
  expect(basicProps.setSearch).toHaveBeenCalledWith("hello world")
})

test("executeMapSearch recognizes 4 bounds", () => {
  executeMapSearch(basicProps, "1.1,2.2,3.3,4.4", (loading) => {})
  expect(basicProps.setSearch).not.toHaveBeenCalled()
  expect(basicProps.updateChallengeSearchMapBounds).toHaveBeenCalledWith([1.1, 2.2, 3.3, 4.4], true)
})

test("executeMapSearch recognizes 2 bounds as centerpoint", () => {
  executeMapSearch(basicProps, "1,4", (loading) => {})
  expect(basicProps.setSearch).not.toHaveBeenCalled()
  expect(basicProps.updateChallengeSearchMapBounds).toHaveBeenCalledWith([0.625, 3.625, 1.375, 4.375], true)
})

test("executeMapSearch recognizes string for Nominatim search", () => {
  executeMapSearch(basicProps, "moscow", (loading) => {})
  expect(fetchPlaceLocation).toHaveBeenCalledWith("moscow")
})
