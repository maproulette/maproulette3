import React from 'react'
import CommentList from './CommentList'

let challengeId = null
let taskId = null
let basicProps = null

beforeEach(() => {
  challengeId = 987
  taskId = 654

  basicProps = {
    comments: [
      {
        id: 123,
        osm_username: "bob",
        comment: "Bob's comment",
        created: "2017-02-24T20:42:19-08:00",
        challengeId,
        taskId,
      },
      {
        id: 456,
        osm_username: "sarah",
        comment: "Sarah's comment",
        created: "2017-02-24T21:42:19-08:00",
        challengeId,
        taskId,
      },
      {
        id: 789,
        osm_username: "joe",
        comment: "Joe's comment",
        created: "2017-02-25T12:42:19-08:00",
        challengeId,
        taskId,
      },
    ]
  }
})

test('it renders a list of the given comments', () => {
  const wrapper = shallow(
    <CommentList {...basicProps} />
  )

  expect(wrapper.find('li').length).toBe(basicProps.comments.length)

  // Make sure each comment is represented in the list
  basicProps.comments.forEach(comment => {
    expect(new RegExp(comment.osm_username).test(wrapper.text())).toBe(true)
  })

  expect(wrapper).toMatchSnapshot()
})

test('it renders a div with class none if there are no comments', () => {
  basicProps.comments= []

  const wrapper = shallow(
    <CommentList {...basicProps} />
  )

  expect(wrapper.find('li').length).toBe(0)
  expect(wrapper.find('.none').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

test("task links are not shown by default", () => {
  const wrapper = shallow(
    <CommentList {...basicProps} />
  )

  expect(wrapper.find('.comment-list__comment__task-link').exists()).not.toBe(true)
})

test("task links are shown if includeTaskLinks prop is set to true", () => {
  const wrapper = shallow(
    <CommentList includeTaskLinks {...basicProps} />
  )

  expect(wrapper.find(
    '.comment-list__comment__task-link'
  ).length).toBe(basicProps.comments.length)

  expect(wrapper).toMatchSnapshot()
})
