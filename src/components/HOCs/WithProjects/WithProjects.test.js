import { vi } from "vitest";
import { denormalize } from 'normalizr'
import { mapStateToProps, mapDispatchToProps } from './WithProjects'
import { fetchProjectChallenges }
       from '../../../services/Challenge/Challenge'

vi.mock('normalizr')
vi.mock('../../../services/Challenge/Challenge')

denormalize.mockImplementation((project) => project)

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
  const dispatch = vi.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch, {})

  mappedProps.fetchProjectChallenges("someProjectId")
  expect(dispatch).toBeCalled()
  expect(fetchProjectChallenges).toBeCalledWith("someProjectId")
})
