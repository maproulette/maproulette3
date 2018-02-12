import React, { Component } from 'react'
import { denormalize } from 'normalizr'
import { mapStateToProps, mapDispatchToProps } from './WithProjects'
import { fetchProjectChallenges }
       from '../../../services/Challenge/Challenge'

jest.mock('normalizr')
jest.mock('../../../services/Challenge/Challenge')

denormalize.mockImplementation((project, schema, entities) => project)

let basicState = null

beforeEach(() => {
  basicState = {
    entities: {
      projects: [
        {
          id: "123",
          name: "first",
        },
        {
          id: "456",
          name: "second",
        }
      ],
    }
  }
})

test("mapStateToProps maps projects", () => {
  const mappedProps = mapStateToProps(basicState)
  expect(mappedProps.projects).toEqual(basicState.entities.projects)

  expect(mappedProps).toMatchSnapshot()
})

test("mapDispatchToProps maps function fetchProjectChallenges", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  mappedProps.fetchProjectChallenges("someProjectId")
  expect(dispatch).toBeCalled()
  expect(fetchProjectChallenges).toBeCalledWith("someProjectId")
})
