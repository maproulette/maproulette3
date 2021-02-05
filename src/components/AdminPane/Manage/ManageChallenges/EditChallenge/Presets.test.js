import { preparePresetsForSaving, preparePresetsForForm } from './Presets'

describe("preparePresetsForSaving", () => {
  let challengeData = null

  beforeEach(() => {
    challengeData = {
      name: "Foo Challenge",
      presets: true,
      "category-barrier": ["barrier/wall", "barrier/kerb"],
      "category-building": ["building"],
    }
  })

  test("disabled presets sets no presets and prunes categories", () => {
    challengeData.presets = false
    const results = preparePresetsForSaving(challengeData)

    expect(results.presets.length).toEqual(0)
    expect(results["category-barrier"]).toEqual(undefined)
    expect(results["category-building"]).toEqual(undefined)
  })

  test("enabled presets builds presets array and prunes categories", () => {
    const results = preparePresetsForSaving(challengeData)

    expect(results.presets.length).toEqual(3)
    expect(results.presets).toEqual(expect.arrayContaining(["barrier/wall"]))
    expect(results.presets).toEqual(expect.arrayContaining(["barrier/kerb"]))
    expect(results.presets).toEqual(expect.arrayContaining(["building"]))
    expect(results["category-barrier"]).toEqual(undefined)
    expect(results["category-building"]).toEqual(undefined)
  })

  test("enabled, but empty, presets sets no presets and prunes categories", () => {
    challengeData.presets = true
    challengeData["category-barrier"] = []
    challengeData["category-building"] = []

    const results = preparePresetsForSaving(challengeData)

    expect(results.presets.length).toEqual(0)
    expect(results["category-barrier"]).toEqual(undefined)
    expect(results["category-building"]).toEqual(undefined)
  })
})

describe("preparePresetsForForm", () => {
  let challengeData = null

  beforeEach(() => {
    challengeData = {
      name: "Foo Challenge",
      presets: ["barrier/wall", "barrier/kerb", "building"],
    }
  })

  test("sets presets to false if there are no presets", () => {
    challengeData.presets = undefined

    const results = preparePresetsForForm(challengeData)
    expect(results.presets).toBe(false)
    expect(results["category-barrier"]).toEqual(undefined)
    expect(results["category-building"]).toEqual(undefined)
  })

  test("sets presets to false if presets are empty", () => {
    challengeData.presets = []

    const results = preparePresetsForForm(challengeData)
    expect(results.presets).toBe(false)
    expect(results["category-barrier"]).toEqual(undefined)
    expect(results["category-building"]).toEqual(undefined)
  })

  test("sets top-level category fields with array of relevant presets", () => {
    const results = preparePresetsForForm(challengeData)

    expect(results.presets).toBe(true)
    expect(results["category-barrier"].length).toEqual(2)
    expect(results["category-barrier"]).toEqual(expect.arrayContaining(["barrier/wall"]))
    expect(results["category-barrier"]).toEqual(expect.arrayContaining(["barrier/kerb"]))
    expect(results["category-building"].length).toEqual(1)
    expect(results["category-building"]).toEqual(expect.arrayContaining(["building"]))
  })
})

