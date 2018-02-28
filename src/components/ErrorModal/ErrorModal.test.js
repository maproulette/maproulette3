import React from 'react'
import { ErrorModal } from './ErrorModal'

let basicProps = null

beforeEach(() => {
  basicProps = {
    errors: [
      {
        id: "first-error",
        defaultMessage: "First Error"
      },
      {
        id: "second-error",
        defaultMessage: "Second Error"
      },
      {
        id: "third-error",
        defaultMessage: "Third Error"
      },
    ],
    removeError: jest.fn(),
    clearErrors: jest.fn(),
    formatMessage: jest.fn((params) => params.defaultMessage),
  }
})

test('it renders a list of the given errors', () => {
  const wrapper = shallow(
    <ErrorModal {...basicProps} />
  )

  expect(wrapper.find('li').length).toBe(basicProps.errors.length)

  expect(wrapper).toMatchSnapshot()
})
