import React, { Component } from 'react'
import { mapStateToProps, mapDispatchToProps } from './WithChallenges'

let basicState = null

beforeEach(() => {
  basicState = {
    entities: {
      challenges: [
        {
          name: "challenge1",
          difficulty: "hard",
        },
        {
          name: "challenge2",
          difficulty: "easy",
        },
      ]
    }
  }
})

test("mapStateToProps maps all entities.challenges when allStatuses is true", () => {
  const mappedProps = mapStateToProps(basicState, {allStatuses: true})
  expect(mappedProps.challenges).toEqual(basicState.entities.challenges)
})
