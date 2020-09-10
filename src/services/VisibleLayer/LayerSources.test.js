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
let layerName = null

beforeEach(() => {
  layerId = "fooLayer"
  layerUrl = "http://www.example.com/foo"
  layerName = "fooLayerName"
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
    const layer = createDynamicLayerSource(layerId, layerName, layerUrl)

    expect(layer.id).toEqual(layerId)
    expect(layer.name).toEqual(layerName)
    expect(layer.url).toEqual(layerUrl)
    expect(layer.isDynamic).toBe(true)
  })
})

describe("basemapLayerSource", () => {
  test("Returns a constant layer if defaultBasemap setting matches", () => {
    const layer = basemapLayerSource(ChallengeBasemap.openStreetMap, layerId)
    expect(layer.id).toEqual(OPEN_STREET_MAP)
  })

  test("Returns an identified layer if defaultBasemap setting matches", () => {
    const layer = basemapLayerSource(ChallengeBasemap.identified, 'osm-mapnik-black_and_white')
    expect(layer.id).toEqual('osm-mapnik-black_and_white')
  })

  test("Returns null if basemap set to none", () => {
    const layer = basemapLayerSource(ChallengeBasemap.none, layerId)
    expect(layer).toBeNull()
  })

  test("Returns custom layer if set to custom and url provided", () => {
    const layer = basemapLayerSource({id: layerId, name: layerId, url: layerUrl}, layerId)

    expect(layer.id).toEqual(layerId)
    expect(layer.url).toEqual(layerUrl)
    expect(layer.isDynamic).toBe(true)
  })

  test("Returns null for custom layer if no url provided", () => {
    const layer = basemapLayerSource({id: layerId, name: layerId}, layerId)

    expect(layer).toBeNull()
  })
})
