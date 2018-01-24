import React from 'react'
import SavedTasks from './SavedTasks'

let basicProps = null

beforeEach(() => {
  basicProps = {
    user: {
      savedTasks: [
        {
          id: 123,
          name: "First Task",
          parent: {
            id: 321,
            name: "First Challenge"
          },
        },
        {
          id: 456,
          name: "Second Task",
          parent: {
            id: 654,
            name: "Second Challenge"
          },
        },
        {
          id: 789,
          name: "Third Task",
          parent: {
            id: 987,
            name: "Third Challenge"
          },
        },
      ]
    },
    intl: {
      formatMessage: jest.fn(),
    }
  }
})

test('it renders a list of the saved tasks with links to each', () => {
  const wrapper = shallow(
    <SavedTasks {...basicProps} />
  )

  expect(wrapper.find('li').length).toBe(basicProps.user.savedTasks.length)

  // Make sure each task is represented in the list
  basicProps.user.savedTasks.forEach(task =>
    expect(wrapper.find('Link').findWhere(link =>
      new RegExp(task.id).test(link.prop('to'))
    ).exists()).toBe(true)
  )

  expect(wrapper).toMatchSnapshot()
})

test('it renders a div with class none if there are no saved tasks', () => {
  basicProps.user.savedTasks= []

  const wrapper = shallow(
    <SavedTasks {...basicProps} />
  )

  expect(wrapper.find('li').length).toBe(0)
  expect(wrapper.find('.none').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})
