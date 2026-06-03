import { describe, expect, it } from 'vitest'
import { detectLocalGeoJSONSubmission, isLineByLineGeoJSONText } from './localGeoJSON.ts'

const RS = '\x1e'

const featureCollection = (name: string) =>
  JSON.stringify({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-95.454772, 37.6866588] },
        properties: { name },
      },
    ],
  })

describe('local GeoJSON submission detection', () => {
  it('detects RFC 7464 record-separated line-by-line GeoJSON', async () => {
    const body = `${RS}${featureCollection('one')}\n${RS}${featureCollection('two')}\n`
    const file = new File([body], 'tasks.geojson')

    expect(isLineByLineGeoJSONText(body)).toBe(true)
    await expect(detectLocalGeoJSONSubmission(file)).resolves.toMatchObject({
      kind: 'lineByLine',
      file,
    })
  })

  it('rejects newline-delimited GeoJSON without a leading record separator', async () => {
    // Detection only recognizes RFC 7464 (leading RS); plain newline delimiters
    // fall through to JSON.parse, which fails on multiple top-level objects.
    const body = `${featureCollection('one')}\n${featureCollection('two')}\n`
    const file = new File([body], 'tasks.geojson')

    expect(isLineByLineGeoJSONText(body)).toBe(false)
    await expect(detectLocalGeoJSONSubmission(file)).rejects.toThrow(SyntaxError)
  })

  it('parses unformatted GeoJSON as a JSON challenge payload', async () => {
    const body = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-97.3452936, 38.0446222] },
          properties: { name: 'The Bread Basket' },
        },
      ],
    })
    const file = new File([body], 'tasks.geojson')

    expect(isLineByLineGeoJSONText(body)).toBe(false)
    await expect(detectLocalGeoJSONSubmission(file)).resolves.toMatchObject({
      kind: 'json',
      geoJSON: JSON.parse(body),
    })
  })

  it('parses formatted (pretty-printed) GeoJSON as a JSON challenge payload', async () => {
    const body = JSON.stringify(JSON.parse(featureCollection('pretty')), null, 2)
    const file = new File([body], 'tasks.geojson')

    expect(isLineByLineGeoJSONText(body)).toBe(false)
    await expect(detectLocalGeoJSONSubmission(file)).resolves.toMatchObject({ kind: 'json' })
  })
})
