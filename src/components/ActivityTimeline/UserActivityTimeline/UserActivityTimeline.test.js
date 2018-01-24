import React from 'react'
import { UserActivityTimeline } from './UserActivityTimeline'
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
        action: ACTION_TYPE_UPDATED,
        typeId: ITEM_TYPE_TASK, 
        status: TASK_STATUS_FIXED,
        created: 1510357997739,
      },
      {
        action: ACTION_TYPE_UPDATED,
        typeId: ITEM_TYPE_TASK, 
        status: TASK_STATUS_FIXED,
        created: 1510357997740,
      },
      {
        action: ACTION_TYPE_UPDATED,
        typeId: ITEM_TYPE_TASK, 
        status: TASK_STATUS_SKIPPED,
        created: 1516200787649,
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
    <UserActivityTimeline {...basicProps} />
  )

  expect(wrapper.find('.activity-timeline').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})

test("it consolidates duplicate activities on the same day", () => {
  const wrapper = shallow(
    <UserActivityTimeline {...basicProps} />
  )

  // First two activity entries are dups on the same day.
  expect(wrapper.find(
    '.timeline-item__activity-entry'
  ).length).toBe(basicProps.activity.length - 1)
})

test("it includes a count of the duplicate activities", () => {
  const wrapper = shallow(
    <UserActivityTimeline {...basicProps} />
  )

  // First two activity entries are dups on the same day.
  expect(wrapper.find(
    '.timeline-item__activity-entry .badge[data-badge=2]'
  ).exists()).toBe(true)
})

test("it does not consolidate duplicate activities on different days", () => {
  basicProps.activity[0].created = 0
  const wrapper = shallow(
    <UserActivityTimeline {...basicProps} />
  )

  // We have 3 activities, but the first two are duplicates on the
  // same day and should only be represented once (with a count of 2).
  expect(wrapper.find(
    '.timeline-item__activity-entry'
  ).length).toBe(basicProps.activity.length)

  expect(wrapper).toMatchSnapshot()
})

test("it indicates on the timeline if there is no activity", () => {
  basicProps.activity = []

  const wrapper = shallow(
    <UserActivityTimeline {...basicProps} />
  )

  // First two activity entries are dups on the same day.
  expect(wrapper.find('.timeline-item.no-activity').exists()).toBe(true)

  expect(wrapper).toMatchSnapshot()
})
