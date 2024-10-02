import { osmUserProfileURL, fetchOSMData, fetchOSMElement, fetchOSMElementHistory, fetchOSMChangesets, fetchOSMUser } from './OSM'
import AppErrors from '../Error/AppErrors'
import xmltojson from 'xmltojson'

describe('OSM Service Functions', () => {
  let originalConsoleError
  let parseXMLSpy

  beforeEach(() => {
    originalConsoleError = console.error
    console.error = jest.fn()
    global.fetch = jest.fn()
    parseXMLSpy = jest.spyOn(xmltojson, 'parseXML')
  })

  afterEach(() => {
    console.error = originalConsoleError
    global.fetch.mockClear()
    parseXMLSpy.mockRestore()
  })

  describe('osmUserProfileURL', () => {
    const baseURL = 'https://example.com'

    beforeAll(() => {
      import.meta.env.VITE_OSM_SERVER = baseURL
    })

    afterAll(() => {
      delete import.meta.env.VITE_OSM_SERVER
    })

    it('should construct URLs correctly', () => {
      const testCases = [
        { username: 'testUser', expected: `${baseURL}/user/testUser` },
        { username: 'test@User', expected: `${baseURL}/user/test%40User` },
        { username: '', expected: `${baseURL}/user/` },
      ]

      testCases.forEach(({ username, expected }) => {
        expect(osmUserProfileURL(username)).toBe(expected)
      })
    })
  })

  describe('fetchOSMData', () => {
    const statusToError = {
      400: AppErrors.osm.requestTooLarge,
      509: AppErrors.osm.bandwidthExceeded,
      500: AppErrors.osm.fetchFailure,
    }

    Object.entries(statusToError).forEach(([status, error]) => {
      test(`should handle ${status} error`, async () => {
        global.fetch.mockResolvedValueOnce({ ok: false, status: Number(status) })
        await expect(fetchOSMData('0,0,1,1')).rejects.toEqual(error)
      })
    })

    test('should handle network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network Error'))
      await expect(fetchOSMData('0,0,1,1')).rejects.toEqual(AppErrors.osm.fetchFailure)
    })

    const testXMLResponses = [
      { xml: `<osm><node id="1"></node></osm>`, expectedLength: 1 },
      { xml: `<?xml version="1.0" encoding="UTF-8"?><osm></osm>`, expectedLength: 1 },
      { xml: `<osm><unknown id="1"></unknown></osm>`, expectedLength: 1 },
    ]
    
    testXMLResponses.forEach(({ expectedLength }) => {
      test(`should resolve with XML response of length ${expectedLength}`, async () => {
        const emptyXML = '<osm></osm>'
        global.fetch.mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(emptyXML),
        })
      
        const result = await fetchOSMData('0,0,1,1')
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(result, 'application/xml')
        const elements = xmlDoc.querySelectorAll('*')
        
        expect(elements.length).toBe(expectedLength)
      })
    })    
  })

  describe('fetchOSMElement', () => {
    const statusToError = {
      400: AppErrors.osm.requestTooLarge,
      509: AppErrors.osm.bandwidthExceeded,
      500: AppErrors.osm.fetchFailure,
    }

    Object.entries(statusToError).forEach(([status, error]) => {
      test(`should handle ${status} error`, async () => {
        global.fetch.mockResolvedValueOnce({ ok: false, status: Number(status) })
        await expect(fetchOSMElement('node/12345')).rejects.toEqual(error)
      })
    })

    test('should handle network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network Error'))
      await expect(fetchOSMElement('node/12345')).rejects.toEqual(AppErrors.osm.fetchFailure)
    })

    test('should handle various OSM element scenarios', async () => {
      const testCases = [
        {
          xml: `<osm><way id="1" lat="1.1" lon="1.1"></way></osm>`,
          elementId: 'way/1',
          expected: { id: 1, lat: 1.1, lon: 1.1 },
        },
        {
          xml: `<osm><node id="1" lat="1.1" lon="1.1"></node></osm>`,
          elementId: 'node/1',
          expected: { id: 1, lat: 1.1, lon: 1.1 },
        },
        {
          xml: `<osm>${'<node id="1" lat="1.1" lon="1.1"></node>'.repeat(10)}</osm>`,
          elementId: 'node/1',
          expected: { id: 1, lat: 1.1, lon: 1.1 },
        },
        {
          xml: `<osm><node id="1" lat="1.1" lon="1.1"></node></osm>`,
          elementId: 'node/1',
          expected: { id: 1, lat: 1.1, lon: 1.1 },
          asXML: true,
        },
      ]

      for (const { xml, elementId, expected, asXML } of testCases) {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(xml),
        })

        const result = await fetchOSMElement(elementId, asXML)
        if (asXML) {
          expect(result.querySelector('node')).toBeDefined()
        } else {
          expect(result).toEqual(expected)
        }
      }
    })

    test('should handle empty responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('<xml></xml>'),
      })
      const result = await fetchOSMElement('way/12345')
      expect(result).toBeUndefined()
    })

    test('should handle malformed XML gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('<xml><malformed>'),
      })
      const result = await fetchOSMElement('way/12345')
      expect(result).toBeUndefined()
    })
  })

  describe('fetchOSMElementHistory', () => {
    const testCases = [
      {
        history: { elements: [{ id: '1', changeset: '100' }, { id: '2', changeset: '101' }] },
        changesetsXML: `<osm><changeset id="100" details="changeset 100 details"></changeset><changeset id="101" details="changeset 101 details"></changeset></osm>`,
        expectedLength: 2,
      },
      {
        history: { elements: [{ id: '1', changeset: '999' }, { id: '2', changeset: '888' }] },
        changesetsXML: '<osm></osm>',
        expectedLength: 2,
      },
    ]

    testCases.forEach(({ history, changesetsXML, expectedLength }) => {
      test('should handle changesets correctly', async () => {
        global.fetch
          .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue(history) })
          .mockResolvedValueOnce({ ok: true, text: jest.fn().mockResolvedValue(changesetsXML) })

        const result = await fetchOSMElementHistory('way/12345', true)
        expect(result).toHaveLength(expectedLength)
        expect(result[0].changeset).toBe(history.elements[0].changeset)
        expect(result[1].changeset).toBe(history.elements[1].changeset)
      })
    })

    test('should handle 404 not found error', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 404 })
      await expect(fetchOSMElementHistory('way/12345', true)).rejects.toEqual(AppErrors.osm.elementMissing)
    })

    test('should handle invalid element IDs gracefully', async () => {
      const mockHistory = {
        elements: [
          { id: 'invalid_id', changeset: '100' },
          { id: 'another_invalid_id', changeset: '101' }
        ]
      }

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockHistory),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue('<osm></osm>'),
        })

      const history = await fetchOSMElementHistory('way/12345', true)

      expect(history).toHaveLength(2)
      expect(history[0].changeset).toBe('100')
      expect(history[1].changeset).toBe('101')
    })
  })

  describe('fetchOSMChangesets', () => {
    const statusToError = {
      400: AppErrors.osm.requestTooLarge,
      404: AppErrors.osm.elementMissing,
      509: AppErrors.osm.bandwidthExceeded,
      500: AppErrors.osm.fetchFailure,
    }

    Object.entries(statusToError).forEach(([status, error]) => {
      test(`should handle ${status} error`, async () => {
        global.fetch.mockResolvedValueOnce({ ok: false, status: Number(status) })
        await expect(fetchOSMChangesets(['123'])).rejects.toEqual(error)
      })
    })

    test('should handle network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network Error'))
      await expect(fetchOSMChangesets(['123'])).rejects.toEqual(AppErrors.osm.fetchFailure)
    })

    test('should handle valid changesets response', async () => {
      const changesetXML = '<osm><changeset id="1" details="details 1"></changeset></osm>'
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(changesetXML),
      })
    
      const result = await fetchOSMChangesets(['123'])
      expect(result.length).toBe(1)
      expect(result[0].id.toString()).toBe('1')
      expect(result[0].details).toBe('details 1')
    })

    test('should handle empty changesets response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('<osm></osm>'),
      })

      const result = await fetchOSMChangesets(['123'])
      expect(result).toHaveLength(0)
    })

    test('should handle malformed XML gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('<xml><malformed>'),
      })

      const result = await fetchOSMChangesets(['123'])
      expect(result).toHaveLength(0)
    })
  })
  describe('fetchOSMUser', () => {  
    test('should return user data with display name when successful', async () => {
      const osmUserId = '12345'
      const xmlResponse = `<user display_name="Test User"/>`
  
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(xmlResponse),
      })
  
      const result = await fetchOSMUser(osmUserId)
      expect(result).toEqual({ id: osmUserId, displayName: 'Test User' })
    })
  
    test('should return user data with null display name when no display name present', async () => {
      const osmUserId = '12345'
      const xmlResponse = `<user/>`
  
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(xmlResponse),
      })
  
      const result = await fetchOSMUser(osmUserId)
      expect(result).toEqual({ id: osmUserId, displayName: null })
    })
  
    test('should return an empty object when 404 error is returned', async () => {
      const osmUserId = '12345'
  
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
  
      const result = await fetchOSMUser(osmUserId)
      expect(result).toEqual({})
    })
  
    test('should handle other HTTP errors', async () => {
      const osmUserId = '12345'
      const mockResponse = { ok: false, status: 500 }
  
      global.fetch.mockResolvedValueOnce(mockResponse)
  
      await expect(fetchOSMUser(osmUserId)).rejects.toEqual(AppErrors.osm.fetchFailure)
    })
  
    test('should handle network errors', async () => {
      const osmUserId = '12345'
      const mockError = new Error('Network Error')
  
      global.fetch.mockRejectedValueOnce(mockError)
  
      await expect(fetchOSMUser(osmUserId)).rejects.toEqual(AppErrors.osm.fetchFailure)
    })
  })
})
