import AsManageable from './AsManageable'

let challenge = null

beforeEach(() => {
  challenge = {
    id: 123,
  }
})

describe("isRebuildable", () => {
  test("returns true if the challenge has an overpass query", () => {
    challenge.overpassQL = "foo"

    const wrappedChallenge = AsManageable(challenge)
    expect(wrappedChallenge.isRebuildable()).toBe(true)
  })

  test("returns false if the challenge was not built from refreshable data", () => {
    const wrappedChallenge = AsManageable(challenge)
    expect(wrappedChallenge.isRebuildable()).toBe(false)

    wrappedChallenge.localGeoJSON = '{"foo": "bar"}'
    expect(wrappedChallenge.isRebuildable()).toBe(false)
  })
})
