import { describe, it, expect, vi } from "vitest";
import { exportOSMData } from "./Challenge";

const mockGeojson = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          20.28233073276013,
          12.457374955871742
        ],
        "type": "Point"
      }
    }
  ]
}

describe("exportOSMData", () => {
  beforeEach(() => {
    const headers = new Map();
    headers.set('content-type', 'application/json')

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => mockGeojson,
        status: 200,
        headers
      })
    );
  });

  afterEach(() => {
    fetch.mockClear()
  })

  it("returns osm data", async () => {
    const osmData = await exportOSMData('mockEndpoint');

    expect(osmData.includes('lat=\"12.457374955871742\" lon=\"20.28233073276013\"')).toBe(true);
    expect(osmData.includes('download="never" upload="never"')).toBe(true);
  });
});