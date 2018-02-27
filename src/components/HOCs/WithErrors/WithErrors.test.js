import React, { Component } from 'react'
import { mapStateToProps, mapDispatchToProps } from './WithErrors'
import { addError,
         removeError,
         clearErrors } from '../../../services/Error/Error'

jest.mock('../../../services/Error/Error')

let basicState = null
let anError = null

beforeEach(() => {
  anError = {
    id: "Errors.foo.bar.baz",
    defaultMessage: "A foo bar baz error.",
  }

  basicState = {
    currentErrors: [anError],
  }
})

test("mapStateToProps maps currentErrors to errors", () => {
  const mappedProps = mapStateToProps(basicState)
  expect(mappedProps.errors).toEqual(basicState.currentErrors)

  expect(mappedProps).toMatchSnapshot()
})

test("mapDispatchToProps maps function addError", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  mappedProps.addError(anError)
  expect(dispatch).toBeCalled()
  expect(addError).toBeCalledWith(anError)
})

test("mapDispatchToProps maps function clearErrors", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  mappedProps.clearErrors()
  expect(dispatch).toBeCalled()
  expect(clearErrors).toBeCalled()
})
