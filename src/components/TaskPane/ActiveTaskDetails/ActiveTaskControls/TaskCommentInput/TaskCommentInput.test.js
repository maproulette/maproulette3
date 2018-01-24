import React from 'react'
import TaskCommentInput from './TaskCommentInput'

let basicProps = null

beforeEach(() => {
  basicProps = {
    value: "foo",
    commentChanged: jest.fn(),
    intl: {formatMessage: jest.fn()},
  }
})

test("it renders a comment input with the given value", () => {
  const wrapper = shallow(
    <TaskCommentInput {...basicProps} />
  )

  expect(wrapper.find('input').exists()).toBe(true)
  expect(wrapper.find('input').getElement().props.value).toBe(basicProps.value)

  expect(wrapper).toMatchSnapshot()
})

test("it signals when the user has modified the input", () => {
  const wrapper = shallow(
    <TaskCommentInput {...basicProps} />
  )

  wrapper.find('input').simulate('change', {target: {value: 'bar' }})

  expect(basicProps.commentChanged.mock.calls.length).toBe(1)
  expect(basicProps.commentChanged.mock.calls[0][0]).toBe('bar')
})
