import AsIdentifiableFeature from './AsIdentifiableFeature'

let basicFeature = null

beforeEach(() => {
  basicFeature = {
    properties: {
      foo: "bar",
    }
  }
})

describe('rawFeatureId', () => {
  test("returns the raw id from the `osmid` field if it exists", () => {
    basicFeature.osmid = '123'

    expect(AsIdentifiableFeature(basicFeature).rawFeatureId()).toEqual('123')
  })

  test("returns the raw id from the `@id` field if it exists", () => {
    basicFeature['@id'] = 'node/1042007773'

    expect(AsIdentifiableFeature(basicFeature).rawFeatureId()).toEqual('node/1042007773')
  })

  test("also looks for `osmid` property if no fields match", () => {
    basicFeature.properties.osmid = '123'

    expect(AsIdentifiableFeature(basicFeature).rawFeatureId()).toEqual('123')
  })

  test("also looks for `@id` property if no fields match", () => {
    basicFeature.properties['@id'] = 'node/1042007773'

    expect(AsIdentifiableFeature(basicFeature).rawFeatureId()).toEqual('node/1042007773')
  })

  test("favors @id over osmid if both are present", () => {
    basicFeature.properties['@id'] = 'way/456'
    basicFeature.properties.osmid = '123'

    expect(AsIdentifiableFeature(basicFeature).rawFeatureId()).toEqual('way/456')
  })
})


describe('osmId', () => {
  test("returns the numerical id from the `osmid` field if it exists", () => {
    basicFeature.osmid = '123'

    expect(AsIdentifiableFeature(basicFeature).osmId()).toEqual('123')
  })

  test("returns the numerical id from the `@id` field if it exists", () => {
    basicFeature['@id'] = 'node/1042007773'

    expect(AsIdentifiableFeature(basicFeature).osmId()).toEqual('1042007773')
  })
})
