import { ChallengeStatus }
       from '../../services/Challenge/ChallengeStatus/ChallengeStatus'
import AsManageableChallenge, { SOURCE_OVERPASS, SOURCE_REMOTE, SOURCE_LOCAL }
       from './AsManageableChallenge'

let challenge = null

beforeEach(() => {
  challenge = {
    id: 123,
  }
})

describe("isRebuildable", () => {
  test("returns false if the challenge has no status", () => {
    const wrappedChallenge = AsManageableChallenge(challenge)
    expect(wrappedChallenge.isRebuildable()).toBe(false)
  })

  test("returns false if the challenge is in a building status", () => {
    challenge.status = ChallengeStatus.building

    const wrappedChallenge = AsManageableChallenge(challenge)
    expect(wrappedChallenge.isRebuildable()).toBe(false)
  })

  test("returns true if the challenge is in a ready status", () => {
    challenge.status = ChallengeStatus.ready

    const wrappedChallenge = AsManageableChallenge(challenge)
    expect(wrappedChallenge.isRebuildable()).toBe(true)
  })

  test("returns true if the challenge is in a failed status", () => {
    challenge.status = ChallengeStatus.failed

    const wrappedChallenge = AsManageableChallenge(challenge)
    expect(wrappedChallenge.isRebuildable()).toBe(true)
  })

  test("returns true if the challenge is in a partially-loaded status", () => {
    challenge.status = ChallengeStatus.partiallyLoaded

    const wrappedChallenge = AsManageableChallenge(challenge)
    expect(wrappedChallenge.isRebuildable()).toBe(true)
  })

  test("returns true if the challenge is in a finished status", () => {
    challenge.status = ChallengeStatus.finished

    const wrappedChallenge = AsManageableChallenge(challenge)
    expect(wrappedChallenge.isRebuildable()).toBe(true)
  })
})

describe("dataSource", () => {
  test("returns overpass if the challenge has an overpass query", () => {
    challenge.overpassQL = "foo"

    const wrappedChallenge = AsManageableChallenge(challenge)
    expect(wrappedChallenge.dataSource()).toEqual(SOURCE_OVERPASS)
  })

  test("returns remote if the challenge has a remote url", () => {
    challenge.remoteGeoJson = "foo"

    const wrappedChallenge = AsManageableChallenge(challenge)
    expect(wrappedChallenge.dataSource()).toEqual(SOURCE_REMOTE)
  })

  test("returns local if the challenge has neither an overpass query nor a remote url", () => {
    const wrappedChallenge = AsManageableChallenge(challenge)
    expect(wrappedChallenge.dataSource()).toEqual(SOURCE_LOCAL)
  })
})
