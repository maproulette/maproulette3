import { fromLatLngBounds, toLatLngBounds } from './MapBounds'
import L from 'leaflet'

const north = 45
const south = -45 
const east = 100 
const west = -100

describe('fromLatLngBounds', () => {
  it("converts leaflet LatLngBounds to array of [w, s, e, n]", () => {
    const bounds = L.latLngBounds(L.latLng({lat: north, lng: west}),
                                  L.latLng({lat: south, lng: east}))

    expect(fromLatLngBounds(bounds)).toEqual([west, south, east, north])
  })

  it("simply returns the array if passed array bounds", () => {
    const arrayBounds = [west, south, east, north]
    expect(fromLatLngBounds(arrayBounds)).toBe(arrayBounds)
  })

  it("returns null if given an empty object", () => {
    expect(fromLatLngBounds({})).toBeNull
  })

  it("throws an error if given an invalid bounds object", () => {
    expect(() => fromLatLngBounds({foo: "bar"})).toThrow()
  })
})

describe('toLatLngBounds', () => {
  it("converts array of [w, s, e, n] to leaflet LatLngBounds", () => {
    const arrayBounds = [west, south, east, north]
    const result = toLatLngBounds(arrayBounds)

    expect(result.getNorth()).toBe(north)
    expect(result.getSouth()).toBe(south)
    expect(result.getEast()).toBe(east)
    expect(result.getWest()).toBe(west)
  })

  it("simply returns the LatLngBounds if passed one", () => {
    const bounds = L.latLngBounds(L.latLng({lat: north, lng: west}),
                                  L.latLng({lat: south, lng: east}))
    expect(toLatLngBounds(bounds)).toBe(bounds)
  })

  it("returns null if given an empty array", () => {
    expect(toLatLngBounds([])).toBeNull
  })

  it("throws an error if given an array with missing coordinates", () => {
    expect(() => toLatLngBounds([north, south, east])).toThrow()
  })
})
