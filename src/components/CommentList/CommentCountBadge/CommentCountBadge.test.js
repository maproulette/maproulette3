import React from 'react'
import CommentCountBadge from './CommentCountBadge'

test('it renders a badge with the count of the given comments', () => {
  const wrapper = shallow(
    <CommentCountBadge comments={[{id: 123}, {id: 456}, {id: 789}]} />
  )

  expect(wrapper.find('.badge[data-badge=3]').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test('it renders a badge with is-empty class for empty comments', () => {
  const wrapper = shallow(
    <CommentCountBadge />
  )

  expect(wrapper.find('.badge.is-empty[data-badge=0]').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})
