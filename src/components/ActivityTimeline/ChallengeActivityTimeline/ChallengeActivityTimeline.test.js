import React from 'react'
import { ChallengeActivityTimeline } from './ChallengeActivityTimeline'
import { ACTION_TYPE_UPDATED }
       from '../../../services/Activity/ActivityActionTypes/ActivityActionTypes'

import { ITEM_TYPE_TASK } 
       from '../../../services/Activity/ActivityItemTypes/ActivityItemTypes'
import { TASK_STATUS_FIXED, TASK_STATUS_SKIPPED }
       from '../../../services/Task/TaskStatus/TaskStatus'

let basicProps = null

beforeEach(() => {
  basicProps = {
    activity: [
      {
        date: "2017-11-22T00:00:00",
        status: TASK_STATUS_FIXED,
        count: 2,
        statusName: "Fixed",
      },
      {
        date: "2017-11-22T00:00:00",
        status: TASK_STATUS_SKIPPED,
        count: 0,
        statusName: "Skipped",
      },
      {
        date: "2017-11-23T00:00:00",
        status: TASK_STATUS_FIXED,
        count: 1,
        statusName: "Fixed",
      },
    ],
    intl:{
      formatMessage: jest.fn(),
      formatDate: jest.fn(),
    },
  }
})

test("it renders a timeline of the activity", () => {
  const wrapper = shallow(
    <ChallengeActivityTimeline {...basicProps} />
  )

  expect(wrapper.find('.activity-timeline').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("activity items with a count of zero are not included", () => {
  const wrapper = shallow(
    <ChallengeActivityTimeline {...basicProps} />
  )

  expect(wrapper.find(
    '.timeline-item__activity-entry'
  ).length).toBe(basicProps.activity.length - 1)
})

test("the activity count is shown", () => {
  const wrapper = shallow(
    <ChallengeActivityTimeline {...basicProps} />
  )

  // First two activity entries are dups on the same day.
  expect(wrapper.find(
    '.timeline-item__activity-entry .badge[data-badge=2]'
  ).exists()).toBe(true)
})

test("it indicates on the timeline if there is no activity", () => {
  basicProps.activity = []

  const wrapper = shallow(
    <ChallengeActivityTimeline {...basicProps} />
  )

  // First two activity entries are dups on the same day.
  expect(wrapper.find('.timeline-item.no-activity').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})
