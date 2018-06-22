import { featureOSMId,
         constructJosmURI,
         constructIdURI } from './Editor'
import _cloneDeep from 'lodash/cloneDeep'

let task = null
let basicFeature = null
let pointFeature = null
let lineStringFeature = null
let polygonFeature = null
let multiPolygonFeature = null
let taskGeometries = null
let challenge = null
let southWestCorner = null
let northEastCorner = null
let centerPoint = null
let mapBounds = null

beforeEach(() => {
  basicFeature = {
    type: 'Feature',
    properties: {
      firstTag: "foo",
      secondTag: "bar",
    }
  }

  pointFeature = Object.assign(_cloneDeep(basicFeature), {
    geometry: {
      type: "Point",
      coordinates: [102.0, 0.5],
    }
  })

  lineStringFeature = Object.assign(_cloneDeep(basicFeature), {
    geometry: {
      type: "LineString",
      coordinates: [
        [102.0, 0.0],
        [103.0, 1.0],
        [104.0, 0.0],
        [105.0, 1.0],
      ],
    }
  })

  polygonFeature = Object.assign(_cloneDeep(basicFeature), {
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [100.0, 0.0],
          [101.0, 0.0],
          [101.0, 1.0],
          [100.0, 1.0],
          [100.0, 0.0],
        ]
      ]
    }
  })

  multiPolygonFeature = Object.assign(_cloneDeep(basicFeature), {
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [180.0, 40.0], [180.0, 50.0], [170.0, 50.0],
            [170.0, 40.0], [180.0, 40.0],
          ]
        ],
        [
          [
            [-170.0, 40.0], [-170.0, 50.0], [-180.0, 50.0],
            [-180.0, 40.0], [-170.0, 40.0],
          ]
        ],
      ]
    }
  })

  challenge = {
    checkinComment: "My checkin comment",
    checkinSource: "My source",
  }

  taskGeometries = {
    features: [
      pointFeature,
    ],
  }

  task = {
    parent: challenge,
    geometries: taskGeometries,
  }

  southWestCorner = {lng: 90, lat: -10}
  northEastCorner = {lng: 110, lat: 10}
  centerPoint = {lng: 100, lat: 0}

  mapBounds = {
    bounds: {
      getSouthWest: jest.fn(() => southWestCorner),
      getNorthEast: jest.fn(() => northEastCorner),
      getCenter: jest.fn(() => centerPoint),
    },
    zoom: 17,
  }
})

describe('constructJosmURI', () => {
  test("the uri includes the load_and_zoom command", () => {
    const uri = constructJosmURI(false, task, mapBounds)
    expect(uri).toEqual(expect.stringContaining("load_and_zoom"))
  })

  test("the uri includes bounding box corners from mapbounds", () => {
    const uri = constructJosmURI(false, task, mapBounds)

    expect(uri).toEqual(expect.stringContaining(`left=${southWestCorner.lng}`))
    expect(uri).toEqual(expect.stringContaining(`bottom=${southWestCorner.lat}`))
    expect(uri).toEqual(expect.stringContaining(`right=${northEastCorner.lng}`))
    expect(uri).toEqual(expect.stringContaining(`top=${northEastCorner.lat}`))
  })

  test("sets new_layer to false if asNewLayer argument is false", () => {
    const uri = constructJosmURI(false, task, mapBounds)

    expect(uri).toEqual(expect.stringContaining("new_layer=false"))
  })

  test("sets new_layer to true if asNewLayer argument is true", () => {
    const uri = constructJosmURI(true, task, mapBounds)

    expect(uri).toEqual(expect.stringContaining("new_layer=true"))
  })

  test("uri includes a URI-encoded checkin comment from the task challenge", () => {
    challenge.checkinComment = "###Non-Conforming"
    const uri = constructJosmURI(true, task, mapBounds)

    expect(uri).toEqual(expect.stringContaining("Conforming"))
    expect(uri).not.toEqual(expect.stringContaining("#"))
  })

  test("uri includes a URI-encoded source from the task challenge", () => {
    const uri = constructJosmURI(true, task, mapBounds)

    expect(uri).toEqual(expect.stringContaining("My%20source"))
  })

  test("uri includes a node selection for Point features with an OSM id", () => {
    pointFeature.properties.osmid = '123'
    taskGeometries.features = [ pointFeature ]
    const uri = constructJosmURI(true, task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(`select=node123`)
    )
  })

  test("uri includes a way selection for LineString features with an OSM id", () => {
    lineStringFeature.properties.osmid = '456'
    taskGeometries.features = [ lineStringFeature ]
    const uri = constructJosmURI(true, task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(`select=way456`)
    )
  })

  test("uri includes a way selection for Polygon features with an OSM id", () => {
    polygonFeature.properties.osmid = '789'
    taskGeometries.features = [ polygonFeature ]
    const uri = constructJosmURI(true, task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(`select=way789`)
    )
  })

  test("uri includes a relation selection for MultiPolygon features with an OSM id", () => {
    multiPolygonFeature.properties.osmid = '135'
    taskGeometries.features = [ multiPolygonFeature ]
    const uri = constructJosmURI(true, task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(`select=relation135`)
    )
  })

  test("features lacking an OSM id are not selected", () => {
    delete pointFeature.properties.osmid
    taskGeometries.features = [ pointFeature ]
    const uri = constructJosmURI(true, task, mapBounds)

    expect(uri).not.toEqual(
      expect.stringContaining('select=node')
    )
  })

  test("features using the alternate @id property are still selected", () => {
    pointFeature.properties['@id'] = '123'
    taskGeometries.features = [ pointFeature ]
    const uri = constructJosmURI(true, task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(`select=node123`)
    )
  })

  test("multiple features are comma-separated in the selection", () => {
    pointFeature.properties.osmid = '123'
    lineStringFeature.properties.osmid = '456'
    multiPolygonFeature.properties.osmid = '135'
    taskGeometries.features = [ pointFeature, lineStringFeature, multiPolygonFeature ]
    const uri = constructJosmURI(true, task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(`select=node123,way456,relation135`)
    )
  })
})

describe('constructIdURI', () => {
  test("the uri specifies the Id editor", () => {
    const uri = constructIdURI(task, mapBounds)
    expect(uri).toEqual(expect.stringContaining("editor=id#"))
  })

  test("the uri includes slash-separated centerpoint and zoom from mapbounds", () => {
    const uri = constructIdURI(task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(`map=${mapBounds.zoom}/${centerPoint.lat}/${centerPoint.lng}`)
    )
  })

  test("uri includes a URI-encoded checkin comment from the task challenge", () => {
    const uri = constructIdURI(task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(
        `comment=${encodeURI(challenge.checkinComment)}`
      )
    )
  })

  test("uri includes a node id for Point features with an OSM id", () => {
    pointFeature.properties.osmid = '123'
    taskGeometries.features = [ pointFeature ]
    const uri = constructIdURI(task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(`id=n123`)
    )
  })

  test("uri includes a way id for LineString features with an OSM id", () => {
    lineStringFeature.properties.osmid = '456'
    taskGeometries.features = [ lineStringFeature ]
    const uri = constructIdURI(task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(`id=w456`)
    )
  })

  test("uri includes a way id for Polygon features with an OSM id", () => {
    polygonFeature.properties.osmid = '789'
    taskGeometries.features = [ polygonFeature ]
    const uri = constructIdURI(task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(`id=w789`)
    )
  })

  test("uri includes a relation id for MultiPolygon features with an OSM id", () => {
    multiPolygonFeature.properties.osmid = '135'
    taskGeometries.features = [ multiPolygonFeature ]
    const uri = constructIdURI(task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(`id=r135`)
    )
  })

  test("features lacking an OSM id are not selected", () => {
    delete pointFeature.properties.osmid
    taskGeometries.features = [ pointFeature ]
    const uri = constructIdURI(task, mapBounds)

    expect(uri).not.toEqual(
      expect.stringContaining('id=n')
    )
  })

  test("features using the alternate @id property are still identified", () => {
    pointFeature.properties['@id'] = '123'
    taskGeometries.features = [ pointFeature ]
    const uri = constructIdURI(task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(`id=n123`)
    )
  })

  test("multiple features are comma-separated in the id", () => {
    pointFeature.properties.osmid = '123'
    lineStringFeature.properties.osmid = '456'
    multiPolygonFeature.properties.osmid = '135'
    taskGeometries.features = [ pointFeature, lineStringFeature, multiPolygonFeature ]
    const uri = constructIdURI(task, mapBounds)

    expect(uri).toEqual(
      expect.stringContaining(`id=n123,w456,r135`)
    )
  })
})

describe('featureOSMId', () => {
  test("returns null if the given feature doesn't have properties", () => {
    delete basicFeature.properties

    expect(featureOSMId(basicFeature)).toBeNull()
  })

  test("returns the numeical id from the `osmid` property if it exists", () => {
    basicFeature.properties.osmid = '"123"'

    expect(featureOSMId(basicFeature)).toEqual('123')
  })

  test("returns the numerical id from the `@id` property if it exists", () => {
    basicFeature.properties['@id'] = '"node/1042007773"'

    expect(featureOSMId(basicFeature)).toEqual('1042007773')
  })

  test("favors osmid over @id if both are present", () => {
    basicFeature.properties.osmid = '123'
    basicFeature.properties['@id'] = 'way/456'

    expect(featureOSMId(basicFeature)).toEqual('123')
  })
})
