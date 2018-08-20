import _each from 'lodash/each'
import { setPreferences,
         removePreferences,
         currentPreferences,
         SET_PREFERENCES,
         REMOVE_PREFERENCES,
         CHALLENGES_PREFERENCE_GROUP } from './Preferences'

let challengeId = null
let challengePreferences = null
let basicState = null

beforeEach(() => {
  challengeId = 123
  challengePreferences = {
    [challengeId]: {
      minimize: true,
      collapseInstructions: true,
    }
  }
})

test("setPreferences sets the group and preference on returned action", () => {
  const group = "myGroup"
  const setting = {123: {mySetting: "foo"}}
  const action = setPreferences(group, setting)

  expect(action.type).toEqual(SET_PREFERENCES)
  expect(action.preferenceGroupName).toEqual(group)
  expect(action.preferenceSetting).toEqual(setting)
})

test("removePreferences sets the group and setting names on returned action", () => {
  const group = "myGroup"
  const settingNames = ['123.foo']
  const action = removePreferences(group, settingNames)

  expect(action.type).toEqual(REMOVE_PREFERENCES)
  expect(action.preferenceGroupName).toEqual(group)
  expect(action.settingNames).toEqual(settingNames)
})

test("currentPreferences adds a preference to an empty group", () => {
  const action = setPreferences(CHALLENGES_PREFERENCE_GROUP, challengePreferences)
  const reduced = currentPreferences({}, action)

  expect(reduced[CHALLENGES_PREFERENCE_GROUP]).toEqual(challengePreferences)
})

test("currentPreferences overwrites existing preference setting", () => {
  const state = {[CHALLENGES_PREFERENCE_GROUP]: {[challengeId]: {minimize: false}}}

  const action = setPreferences(CHALLENGES_PREFERENCE_GROUP, {[challengeId]: {minimize: true}})
  const reduced = currentPreferences(state, action)

  expect(reduced[CHALLENGES_PREFERENCE_GROUP][challengeId].minimize).toBe(true)
})

test("currentPreferences merges preferences to an existing preference set", () => {
  const state = {[CHALLENGES_PREFERENCE_GROUP]: {[challengeId]: {foo: "bar"}}}

  const action = setPreferences(CHALLENGES_PREFERENCE_GROUP, challengePreferences)
  const reduced = currentPreferences(state, action)

  expect(reduced[CHALLENGES_PREFERENCE_GROUP][challengeId].foo).toEqual("bar")
  expect(reduced[CHALLENGES_PREFERENCE_GROUP][challengeId].minimize).toBe(true)
})

test("removePreferences can remove an individual preference setting", () => {
  const state = {[CHALLENGES_PREFERENCE_GROUP]: challengePreferences}
  const action = removePreferences(CHALLENGES_PREFERENCE_GROUP,
                                   [`${challengeId}.minimize`])
  const reduced = currentPreferences(state, action)

  expect(
    reduced[CHALLENGES_PREFERENCE_GROUP][challengeId].minimize
  ).toBeUndefined()
})
