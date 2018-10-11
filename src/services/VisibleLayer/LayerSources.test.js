import React from 'react'
import { ChallengeBasemap }
       from '../Challenge/ChallengeBasemap/ChallengeBasemap'
import { BING,
         OPEN_STREET_MAP,
         LayerSources,
         layerSourceWithId,
         createDynamicLayerSource,
         basemapLayerSource,
         defaultLayerSource } from './LayerSources'

let layerId = null
let layerUrl = null

beforeEach(() => {
  layerId = "fooLayer"
  layerUrl = "http://www.example.com/foo"
})

describe("layerSourceWithId", () => {
  test("returns the LayerSource matching the given id", () => {
    expect(
      layerSourceWithId(OPEN_STREET_MAP).id
    ).toEqual(OPEN_STREET_MAP)

    expect(
      layerSourceWithId(BING).id
    ).toEqual(BING)
  })

  test("returns undefined if no layer matches", () => {
    expect(layerSourceWithId("Foo")).toBeUndefined()
  })
})

describe("createDynamicLayerSource", () => {
  test("Generates layer source with the given id and url", () => {
    const layer = createDynamicLayerSource(layerId, layerUrl)

    expect(layer.id).toEqual(layerId)
    expect(layer.url).toEqual(layerUrl)
    expect(layer.isDynamic).toBe(true)
  })
})

describe("basemapLayerSource", () => {
  test("Returns a constant layer if defaultBasemap setting matches", () => {
    const layer = basemapLayerSource(ChallengeBasemap.openStreetMap, null, null, layerId)
    expect(layer.id).toEqual(OPEN_STREET_MAP)
  })

  test("Returns an identified layer if defaultBasemap setting matches", () => {
    const layer = basemapLayerSource(ChallengeBasemap.identified, 'DigitalGlobe-Premium', null, layerId)
    expect(layer.id).toEqual('DigitalGlobe-Premium')
  })

  test("Returns null if basemap set to none", () => {
    const layer = basemapLayerSource(ChallengeBasemap.none, null, null, layerId)
    expect(layer).toBeNull()
  })

  test("Returns custom layer if set to custom and url provided", () => {
    const layer = basemapLayerSource(ChallengeBasemap.custom, null, layerUrl, layerId)

    expect(layer.id).toEqual(layerId)
    expect(layer.url).toEqual(layerUrl)
    expect(layer.isDynamic).toBe(true)
  })

  test("Returns null for custom layer if no url provided", () => {
    const layer = basemapLayerSource(ChallengeBasemap.custom, null, null, layerId)

    expect(layer).toBeNull()
  })
})
