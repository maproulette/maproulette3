import { denormalize } from 'normalizr'
import { mapStateToProps,
         mapDispatchToProps } from './WithChallengePreferences'
import { TaskLoadMethod }
       from '../../../services/Task/TaskLoadMethod/TaskLoadMethod'
import { BING }
       from '../../../services/VisibleLayer/LayerSources'
import { setPreferences,
         CHALLENGES_PREFERENCE_GROUP,
         VIRTUAL_CHALLENGES_PREFERENCE_GROUP }
       from '../../../services/Preferences/Preferences'

jest.mock('../../../services/Preferences/Preferences')

let challengeId = null
let virtualChallengeId = null
let challengePrefs = null
let virtualChallengePrefs = null
let basicState = null

beforeEach(() => {
  setPreferences.mockClear()

  challengeId = 123
  virtualChallengeId = 987

  challengePrefs = {
    minimize: true,
    collapseInstructions: true,
  }

  virtualChallengePrefs = {
    minimize: true,
    collapseInstructions: true,
    collapseMoreOptions: true,
  }

  basicState = {
    currentPreferences: {
      challenges: {
        [challengeId]: challengePrefs,
      },
      virtualChallenges: {
        [virtualChallengeId]: virtualChallengePrefs,
      }
    },
  }
})

test("maps challenge minimizeChallenge to current minimize preference", () => {
  basicState.currentPreferences.challenges[challengeId].minimize = false
  const mappedProps = mapStateToProps(basicState, {challengeId})

  expect(mappedProps.minimizeChallenge).toBe(false)
})

test("maps virtual challenge minimizeChallenge to current minimize preference", () => {
  basicState.currentPreferences.virtualChallenges[virtualChallengeId].minimize = false
  const mappedProps = mapStateToProps(basicState, {virtualChallengeId})

  expect(mappedProps.minimizeChallenge).toBe(false)
})

test("minimizeChallenge defaults to false if no preference set", () => {
  basicState.currentPreferences.challenges[challengeId].minimize = undefined
  const mappedProps = mapStateToProps(basicState, {challengeId})

  expect(mappedProps.minimizeChallenge).toBe(false)
})

test("maps challenge collapseInstructions to collapseInstructions preference", () => {
  basicState.currentPreferences.challenges[
    challengeId
  ].collapseInstructions = false
  const mappedProps = mapStateToProps(basicState, {challengeId})

  expect(mappedProps.collapseInstructions).toBe(false)
})

test("maps virtual challenge collapseInstructions to collapseInstructions preference", () => {
  basicState.currentPreferences.virtualChallenges[
    virtualChallengeId
  ].collapseInstructions = false
  const mappedProps = mapStateToProps(basicState, {virtualChallengeId})

  expect(mappedProps.collapseInstructions).toBe(false)
})

test("collapseInstructions defaults to false if no preference set", () => {
  basicState.currentPreferences.challenges[
    challengeId
  ].collapseInstructions = undefined
  const mappedProps = mapStateToProps(basicState, {challengeId})

  expect(mappedProps.collapseInstructions).toBe(false)
})

test("maps challenge collapseMoreOptions to collapseMoreOptions preference", () => {
  basicState.currentPreferences.challenges[
    challengeId
  ].collapseMoreOptions = false
  const mappedProps = mapStateToProps(basicState, {challengeId})

  expect(mappedProps.collapseMoreOptions).toBe(false)
})

test("maps virtual challenge collapseMoreOptions to collapseMoreOptions preference", () => {
  basicState.currentPreferences.virtualChallenges[
    virtualChallengeId
  ].collapseMoreOptions = false
  const mappedProps = mapStateToProps(basicState, {virtualChallengeId})

  expect(mappedProps.collapseMoreOptions).toBe(false)
})

test("collapseMoreOptions defaults to true if no preference set", () => {
  basicState.currentPreferences.challenges[
    challengeId
  ].collapseMoreOptions = undefined
  const mappedProps = mapStateToProps(basicState, {challengeId})

  expect(mappedProps.collapseMoreOptions).toBe(true)
})

test("maps challenge taskLoadBy to current taskLoadMethod preference", () => {
  basicState.currentPreferences.challenges[
    challengeId
  ].taskLoadMethod = TaskLoadMethod.proximity

  const mappedProps = mapStateToProps(basicState, {challengeId})
  expect(mappedProps.taskLoadBy).toBe(TaskLoadMethod.proximity)
})

test("maps virtual challenge taskLoadBy to current taskLoadMethod preference", () => {
  basicState.currentPreferences.virtualChallenges[
    virtualChallengeId
  ].taskLoadMethod = TaskLoadMethod.proximity

  const mappedProps = mapStateToProps(basicState, {virtualChallengeId})
  expect(mappedProps.taskLoadBy).toBe(TaskLoadMethod.proximity)
})

test("taskLoadBy defaults to random if no preference set", () => {
  basicState.currentPreferences.challenges[
    challengeId
  ].taskLoadMethod = undefined

  const mappedProps = mapStateToProps(basicState, {challengeId})
  expect(mappedProps.taskLoadBy).toBe(TaskLoadMethod.random)
})

test("maps challenge visibleMapLayer to current visibleMapLayer preference", () => {
  basicState.currentPreferences.challenges[
    challengeId
  ].visibleMapLayer = BING

  const mappedProps = mapStateToProps(basicState, {challengeId})
  expect(mappedProps.visibleMapLayer).toEqual(BING)
})

test("maps virtual challenge visibleMapLayer to current visibleMapLayer preference", () => {
  basicState.currentPreferences.virtualChallenges[
    virtualChallengeId
  ].visibleMapLayer = BING

  const mappedProps = mapStateToProps(basicState, {virtualChallengeId})
  expect(mappedProps.visibleMapLayer).toEqual(BING)
})

test("setChallengeMinimization with virtual false updates the challenge minimize preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setChallengeMinimization(challengeId, false, true)
  expect(dispatch).toBeCalled()
  expect(setPreferences).toBeCalledWith(CHALLENGES_PREFERENCE_GROUP,
                                        {[challengeId]: {minimize: true}})
})

test("setChallengeMinimization with virtual true updates the virtual challenge minimize preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setChallengeMinimization(challengeId, true, true)
  expect(dispatch).toBeCalled()
  expect(setPreferences).toBeCalledWith(VIRTUAL_CHALLENGES_PREFERENCE_GROUP,
                                        {[challengeId]: {minimize: true}})
})

test("setInstructionsCollapsed with virtual false updates the challenge collapseInstructions preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setInstructionsCollapsed(challengeId, false, true)
  expect(dispatch).toBeCalled()
  expect(setPreferences).toBeCalledWith(CHALLENGES_PREFERENCE_GROUP,
                                        {[challengeId]: {collapseInstructions: true}})
})

test("setInstructionsCollapsed with virtual true updates the virtual challenge collapseInstructions preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setInstructionsCollapsed(challengeId, true, true)
  expect(dispatch).toBeCalled()
  expect(setPreferences).toBeCalledWith(VIRTUAL_CHALLENGES_PREFERENCE_GROUP,
                                        {[challengeId]: {collapseInstructions: true}})
})

test("setLoadTasksBy with virtual false updates the challenge taskLoadMethod preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setTaskLoadBy(challengeId, false, TaskLoadMethod.proximity)
  expect(dispatch).toBeCalled()
  expect(
    setPreferences
  ).toBeCalledWith(CHALLENGES_PREFERENCE_GROUP,
                   {[challengeId]: {taskLoadMethod: TaskLoadMethod.proximity}})
})

test("setLoadTasksBy with virtual true updates the virtual challenge taskLoadMethod preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setTaskLoadBy(challengeId, true, TaskLoadMethod.proximity)
  expect(dispatch).toBeCalled()
  expect(
    setPreferences
  ).toBeCalledWith(VIRTUAL_CHALLENGES_PREFERENCE_GROUP,
                   {[challengeId]: {taskLoadMethod: TaskLoadMethod.proximity}})
})

test("setVisibleMapLayer with virtual false updates the challenge visibleMapLayer preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setVisibleMapLayer(challengeId, false, BING)
  expect(dispatch).toBeCalled()
  expect(
    setPreferences
  ).toBeCalledWith(CHALLENGES_PREFERENCE_GROUP,
                   {[challengeId]: {visibleMapLayer: BING}})
})

test("setVisibleMapLayer with virtual true updates the virtual challenge visibleMapLayer preference", () => {
  const dispatch = jest.fn(() => Promise.resolve())
  const mappedProps = mapDispatchToProps(dispatch)

  mappedProps.setVisibleMapLayer(challengeId, true, BING)
  expect(dispatch).toBeCalled()
  expect(
    setPreferences
  ).toBeCalledWith(VIRTUAL_CHALLENGES_PREFERENCE_GROUP,
                   {[challengeId]: {visibleMapLayer: BING}})
})
