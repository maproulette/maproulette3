import Route from './Route'

const base = 'http://localhost'
const baseWithPort = `${base}:9000`
const api = '2'

describe('url', () => {
  it("includes the base url given at construction", () => {
    const route = new Route(base, api, 'somepath')
    expect(route.url()).toMatch(base)
  })

  it("includes the api version given at construction after the base", () => {
    const route = new Route(base, api, 'somepath')
    expect(route.url()).toMatch(`${base}/api/${api}`)
  })

  it("includes the port number if included in the base url", () => {
    const route = new Route(baseWithPort, api, 'somepath')
    expect(route.url()).toMatch(baseWithPort)
  })

  it("substitutes variables into the path", () => {
    const route = new Route(baseWithPort, api, 'path/:first/path/:second')
    expect(route.url({first: 'hello', second: 'world'})).toMatch('path/hello/path/world')
  })

  it("appends query params to the end", () => {
    const route = new Route(baseWithPort, api, 'path/:first/path/:second')
    expect(route.url(
      {first: 'hello', second: 'world'},
      {page: 3, limit: 10}
    )).toMatch('path/hello/path/world?limit=10&page=3')
  })
})
