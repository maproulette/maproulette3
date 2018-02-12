import React, { Component } from 'react'
import { mapStateToProps, mapDispatchToProps } from './WithStatus'
import { FETCHING_CHALLENGES_STATUS,
         CHECKING_LOGIN_STATUS }
       from '../../../services/Status/Status'

let basicState = null

beforeEach(() => {
  basicState = {
    currentStatus: {}
  }
})

test("mapStateToProps maps fetchingChallenges", () => {
  const fetchIds = ["fetch123", "fetch456"]
  basicState.currentStatus[FETCHING_CHALLENGES_STATUS] = fetchIds

  const mappedProps = mapStateToProps(basicState)
  expect(mappedProps.fetchingChallenges).toEqual(fetchIds)

  expect(mappedProps).toMatchSnapshot()
})

test("fetchingChallenges returns empty array if no status", () => {
  const mappedProps = mapStateToProps(basicState)
  expect(mappedProps.fetchingChallenges).toEqual([])

  expect(mappedProps).toMatchSnapshot()
})

test("mapStateToProps maps checkingLoginStatus", () => {
  basicState.currentStatus[CHECKING_LOGIN_STATUS] = true

  const mappedProps = mapStateToProps(basicState)
  expect(mappedProps.checkingLoginStatus).toEqual(true)

  expect(mappedProps).toMatchSnapshot()
})

test("checkingLoginStatus returns false if no status", () => {
  const mappedProps = mapStateToProps(basicState)
  expect(mappedProps.checkingLoginStatus).toEqual(false)

  expect(mappedProps).toMatchSnapshot()
})
