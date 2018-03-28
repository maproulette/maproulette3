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
      layerSourceWithId(OPEN_STREET_MAP).layerId
    ).toEqual(OPEN_STREET_MAP)

    expect(
      layerSourceWithId(BING).layerId
    ).toEqual(BING)
  })

  test("returns undefined if no layer matches", () => {
    expect(layerSourceWithId("Foo")).toBeUndefined()
  })
})

describe("defaultLayerSource", () => {
  test("returns the first layer source if no default set", () => {
    expect(defaultLayerSource()).toEqual(LayerSources[0])
  })

  test("returns the layer with default set to true, if exists", () => {
    const originalDefault = LayerSources[1].default
    LayerSources[1].default = true 

    expect(defaultLayerSource()).toEqual(LayerSources[1])

    LayerSources[1].default = originalDefault
  })
})

describe("createDynamicLayerSource", () => {
  test("Generates layer source with the given id and url", () => {
    const layer = createDynamicLayerSource(layerId, layerUrl)

    expect(layer.layerId).toEqual(layerId)
    expect(layer.url).toEqual(layerUrl)
    expect(layer.isDynamic).toBe(true)
  })
})

describe("basemapLayerSource", () => {
  test("Returns an existing layer if basemap setting matches", () => {
    const layer = basemapLayerSource(ChallengeBasemap.openStreetMap, null, layerId)
    expect(layer.layerId).toEqual(OPEN_STREET_MAP)
  })

  test("Returns null if basemap set to none", () => {
    const layer = basemapLayerSource(ChallengeBasemap.none, null, layerId)
    expect(layer).toBeNull()
  })

  test("Returns custom layer if set to custom and url provided", () => {
    const layer = basemapLayerSource(ChallengeBasemap.custom, layerUrl, layerId)

    expect(layer.layerId).toEqual(layerId)
    expect(layer.url).toEqual(layerUrl)
    expect(layer.isDynamic).toBe(true)
  })

  test("Returns null for custom layer if no url provided", () => {
    const layer = basemapLayerSource(ChallengeBasemap.custom, null, layerId)

    expect(layer).toBeNull()
  })
})
