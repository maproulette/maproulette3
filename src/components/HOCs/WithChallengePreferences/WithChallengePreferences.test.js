import _each from 'lodash/each'
import { denormalize } from 'normalizr'
import { mapStateToProps,
         mapDispatchToProps } from './WithChallengePreferences'
import { TaskLoadMethod }
       from '../../../services/Task/TaskLoadMethod/TaskLoadMethod'
import { BING }
       from '../../../services/VisibleLayer/LayerSources'
import { setPreferences,
         CHALLENGES_PREFERENCE_GROUP }
       from '../../../services/Preferences/Preferences'

jest.mock('../../../services/Preferences/Preferences')

let challenge = null
let basicState = null

beforeEach(() => {
  setPreferences.mockClear()

  challenge = {
    id: 123,
    minimize: true,
    collapseInstructions: true,
  }

  basicState = {
    currentPreferences: {
      challenges: {
        [challenge.id]: challenge,
      }
    },
  }
})

test("maps minimizeChallenge to current minimize preference", () => {
  basicState.currentPreferences.challenges[challenge.id].minimize = false
  const mappedProps = mapStateToProps(basicState, {challengeId: challenge.id})

  expect(mappedProps.minimizeChallenge).toBe(false)
})

test("minimizeChallenge defaults to false if no preference set", () => {
  basicState.currentPreferences.challenges[challenge.id].minimize = undefined
  const mappedProps = mapStateToProps(basicState, {challengeId: challenge.id})

  expect(mappedProps.minimizeChallenge).toBe(false)
})

test("maps collapseInstructions to collapseInstructions preference", () => {
  basicState.currentPreferences.challenges[
    challenge.id
  ].collapseInstructions = false
  const mappedProps = mapStateToProps(basicState, {challengeId: challenge.id})

  expect(mappedProps.collapseInstructions).toBe(false)
})

test("collapseInstructions defaults to false if no preference set", () => {
  basicState.currentPreferences.challenges[
    challenge.id
  ].collapseInstructions = undefined
  const mappedProps = mapStateToProps(basicState, {challengeId: challenge.id})

  expect(mappedProps.collapseInstructions).toBe(false)
})

test("maps taskLoadBy to current taskLoadMethod preference", () => {
  basicState.currentPreferences.challenges[
    challenge.id
  ].taskLoadMethod = TaskLoadMethod.proximity

  const mappedProps = mapStateToProps(basicState, {challengeId: challenge.id})
  expect(mappedProps.taskLoadBy).toBe(TaskLoadMethod.proximity)
})

test("maps visibleMapLayer to current visibleMapLayer preference", () => {
  basicState.currentPreferences.challenges[
    challenge.id
  ].visibleMapLayer = BING

  const mappedProps = mapStateToProps(basicState, {challengeId: challenge.id})
  expect(mappedProps.visibleMapLayer).toEqual(BING)
})

test("taskLoadBy defaults to random if no preference set", () => {
  basicState.currentPreferences.challenges[
    challenge.id
  ].taskLoadMethod = undefined

  const mappedProps = mapStateToProps(basicState, {challengeId: challenge.id})
  expect(mappedProps.taskLoadBy).toBe(TaskLoadMethod.random)
})

test("setChallengeMinimization updates the challenge's minimize preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setChallengeMinimization(challenge.id, true)
  expect(dispatch).toBeCalled()
  expect(setPreferences).toBeCalledWith(CHALLENGES_PREFERENCE_GROUP,
                                        {[challenge.id]: {minimize: true}})
})

test("setInstructionsCollapsed updates the challenge's collapseInstructions preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setInstructionsCollapsed(challenge.id, true)
  expect(dispatch).toBeCalled()
  expect(setPreferences).toBeCalledWith(CHALLENGES_PREFERENCE_GROUP,
                                        {[challenge.id]: {collapseInstructions: true}})
})

test("setLoadTasksBy updates the challenge's taskLoadMethod preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setTaskLoadBy(challenge.id, TaskLoadMethod.proximity)
  expect(dispatch).toBeCalled()
  expect(
    setPreferences
  ).toBeCalledWith(CHALLENGES_PREFERENCE_GROUP,
                   {[challenge.id]: {taskLoadMethod: TaskLoadMethod.proximity}})
})

test("setVisibleMapLayer updates the challenge's visibleMapLayer preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setVisibleMapLayer(challenge.id, BING)
  expect(dispatch).toBeCalled()
  expect(
    setPreferences
  ).toBeCalledWith(CHALLENGES_PREFERENCE_GROUP,
                   {[challenge.id]: {visibleMapLayer: BING}})
})
