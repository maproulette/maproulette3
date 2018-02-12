import React, { Component } from 'react'
import { mapStateToProps, mapDispatchToProps } from './WithErrors'
import { buildError,
         addError,
         removeError,
         clearErrors } from '../../../services/Error/Error'

jest.mock('../../../services/Error/Error')

let basicState = null

beforeEach(() => {
  basicState = {
    currentErrors: "some error"
  }
})

test("mapStateToProps maps currentErrors to errors", () => {
  const mappedProps = mapStateToProps(basicState)
  expect(mappedProps.errors).toEqual(basicState.currentErrors)

  expect(mappedProps).toMatchSnapshot()
})

test("mapDispatchToProps maps function buildError", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  expect(mappedProps.buildError).toBe(buildError)
})

test("mapDispatchToProps maps function addError", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  mappedProps.addError("thisError")
  expect(dispatch).toBeCalled()
  expect(addError).toBeCalledWith("thisError")
})

test("mapDispatchToProps maps function addError", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  mappedProps.addError("thisError")
  expect(dispatch).toBeCalled()
  expect(addError).toBeCalledWith("thisError")
})

test("mapDispatchToProps maps function clearErrors", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  mappedProps.clearErrors()
  expect(dispatch).toBeCalled()
  expect(clearErrors).toBeCalled()
})
