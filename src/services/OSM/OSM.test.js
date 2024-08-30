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
    beforeAll(() => {
      // Mock environment variables
      process.env.REACT_APP_OSM_SERVER = 'https://example.com';
    });
  
    afterAll(() => {
      // Clean up environment variables
      delete process.env.REACT_APP_OSM_SERVER;
    });
  
    it('should construct the correct URL for a given username', () => {
      const username = 'testUser';
      const expectedURL = 'https://example.com/user/testUser';
      expect(osmUserProfileURL(username)).toBe(expectedURL);
    });
  
    it('should encode special characters in the username', () => {
      const username = 'test@User';
      const expectedURL = 'https://example.com/user/test%40User';
      expect(osmUserProfileURL(username)).toBe(expectedURL);
    });
  
    it('should handle empty username', () => {
      const username = '';
      const expectedURL = 'https://example.com/user/';
      expect(osmUserProfileURL(username)).toBe(expectedURL);
    });
  });

  describe('fetchOSMData', () => {
    test('should handle 400 Bad Request error', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 400 })
      await expect(fetchOSMData('0,0,1,1')).rejects.toEqual(AppErrors.osm.requestTooLarge)
    })

    test('should handle 509 Bandwidth Exceeded error', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 509 })
      await expect(fetchOSMData('0,0,1,1')).rejects.toEqual(AppErrors.osm.bandwidthExceeded)
    })

    test('should handle 500 fetch failure', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500 })
      await expect(fetchOSMData('0,0,1,1')).rejects.toEqual(AppErrors.osm.fetchFailure)
    })

    test('should handle network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network Error'))
      await expect(fetchOSMData('0,0,1,1')).rejects.toEqual(AppErrors.osm.fetchFailure)
    })

    test('should resolve with parsed XML when fetch is successful', async () => {
      const mockXML = `<osm><node id="1"></node></osm>`
      const mockDOM = new DOMParser().parseFromString(mockXML, 'application/xml')

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(mockXML),
      })

      await expect(fetchOSMData('0,0,1,1')).resolves.toEqual(mockDOM)
    })

    test('should handle empty response but still be successful', async () => {
      const mockXML = `<?xml version="1.0" encoding="UTF-8"?><osm></osm>`
      const mockDOM = new DOMParser().parseFromString(mockXML, 'application/xml')

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(mockXML),
      })

      await expect(fetchOSMData('0,0,1,1')).resolves.toEqual(mockDOM)
    })

    test('should handle valid XML with unexpected structure', async () => {
      const mockXML = `<osm><unknown id="1"></unknown></osm>`
      const mockDOM = new DOMParser().parseFromString(mockXML, 'application/xml')

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(mockXML),
      })

      await expect(fetchOSMData('0,0,1,1')).resolves.toEqual(mockDOM)
    })
  })

  describe('fetchOSMElement', () => {
    test('should handle 400 Bad Request error', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 400 })
      await expect(fetchOSMElement('node/12345')).rejects.toEqual(AppErrors.osm.requestTooLarge)
    })

    test('should handle 509 Bandwidth Exceeded error', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 509 })
      await expect(fetchOSMElement('node/12345')).rejects.toEqual(AppErrors.osm.bandwidthExceeded)
    })

    test('should handle 500 fetch failure', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500 })
      await expect(fetchOSMElement('node/12345')).rejects.toEqual(AppErrors.osm.fetchFailure)
    })

    test('should handle network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network Error'))
      await expect(fetchOSMElement('node/12345')).rejects.toEqual(AppErrors.osm.fetchFailure)
    })

    test('should correctly handle different OSM element types', async () => {
      const mockXML = `<osm><way id="1" lat="1.1" lon="1.1"></way></osm>`
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(mockXML),
      })
      const result = await fetchOSMElement('way/1')
      expect(result).toEqual({ id: 1, lat: 1.1, lon: 1.1 })
    })

    test('should handle invalid element ID format gracefully', async () => {
      const mockXML = `<osm><node id="1" lat="1.1" lon="1.1"></node></osm>`
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(mockXML),
      })
      const result = await fetchOSMElement('invalid_id_format')
      expect(result).toBeUndefined()
    })

    test('should handle large XML responses', async () => {
      const largeXML = `<osm>${'<node id="1" lat="1.1" lon="1.1"></node>'.repeat(10)}</osm>`
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(largeXML),
      })
      const result = await fetchOSMElement('node/1')
      expect(result).toBeDefined()
    })

    test('should return JSON when asXML is false', async () => {
      const mockXML = `<osm><node id="1" lat="1.1" lon="1.1"></node></osm>`
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(mockXML),
      })
      const result = await fetchOSMElement('node/1', false)
      expect(result).toEqual({ id: 1, lat: 1.1, lon: 1.1 })
    })

    test('should return XML when asXML is true', async () => {
      const mockXML = `<osm><node id="1" lat="1.1" lon="1.1"></node></osm>`
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(mockXML),
      })
      const xmlDoc = await fetchOSMElement('node/1', true)
      expect(xmlDoc.querySelector('node')).toBeDefined()
    })

    test('should handle empty responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('<xml></xml>'),
      })
      const result = await fetchOSMElement('way/12345')
      expect(result).toBeUndefined()
    })
  })

  describe('fetchOSMElementHistory', () => {
    test('should map valid changesets correctly', async () => {
      const mockHistory = {
        elements: [
          { id: '1', changeset: '100' },
          { id: '2', changeset: '101' }
        ]
      }
  
      const mockChangesets = `
        <osm>
          <changeset id="100" details="changeset 100 details"></changeset>
          <changeset id="101" details="changeset 101 details"></changeset>
        </osm>
      `
  
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockHistory),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockChangesets),
        })
  
      const history = await fetchOSMElementHistory('way/12345', true)
  
      expect(history).toHaveLength(2)
      expect(history[0].changeset).toEqual(mockHistory.elements[0].changeset)
      expect(history[1].changeset).toEqual(mockHistory.elements[1].changeset)
    })
  
    test('should handle missing changesets gracefully', async () => {
      const mockHistory = {
        elements: [
          { id: '1', changeset: '999' },
          { id: '2', changeset: '888' }
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
      expect(history[0].changeset).toBe('999')
      expect(history[1].changeset).toBe('888')
    })
  
    test('should handle empty changeset map', async () => {
      const mockHistory = {
        elements: [
          { id: '1', changeset: '100' },
          { id: '2', changeset: '101' }
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
  
    test('should handle 404 not found', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 404 })
      await expect(fetchOSMElementHistory('way/12345', true)).rejects.toEqual(AppErrors.osm.elementMissing)
    })
  
    test('should handle invalid element IDs in history gracefully', async () => {
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
    test('should handle malformed XML response gracefully', async () => {
      const mockXML = `<osm><changeset id="1" /></osm>`
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXML),
      })
  
      const changesets = await fetchOSMChangesets(['1'])
      expect(changesets).toHaveLength(1)
      expect(changesets[0]).toHaveProperty('id', 1)
    })
  
    test('should handle 400 Bad Request error', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 400 })
      await expect(fetchOSMChangesets(['123'])).rejects.toEqual(AppErrors.osm.requestTooLarge)
    })
  
    test('should handle 404 Not Found error', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 404 })
      await expect(fetchOSMChangesets(['123'])).rejects.toEqual(AppErrors.osm.elementMissing)
    })
  
    test('should handle 509 Bandwidth Exceeded error', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 509 })
      await expect(fetchOSMChangesets(['123'])).rejects.toEqual(AppErrors.osm.bandwidthExceeded)
    })
  
    test('should handle 500 fetch failure', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500 })
      await expect(fetchOSMChangesets(['123'])).rejects.toEqual(AppErrors.osm.fetchFailure)
    })
  
    test('should handle network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network Error'))
      await expect(fetchOSMChangesets(['123'])).rejects.toEqual(AppErrors.osm.fetchFailure)
    })
  
    test('should return empty array for no changeset IDs', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<osm></osm>'),
      })
      const changesets = await fetchOSMChangesets([])
      expect(changesets).toEqual([])
    })
  
    test('should return changesets correctly', async () => {
      const mockXML = `<osm><changeset id="1" /></osm>`
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXML),
      })
  
      const changesets = await fetchOSMChangesets(['1'])
      expect(changesets).toHaveLength(1)
      expect(changesets[0]).toHaveProperty('id', 1)
    })
  })
  
  describe('fetchOSMUser', () => {
    test('should handle network errors correctly', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network Error'))
      await expect(fetchOSMUser('12345')).rejects.toEqual(AppErrors.osm.fetchFailure)
    })

    test('should handle 500 status errors correctly', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500 })
      await expect(fetchOSMUser('12345')).rejects.toEqual(AppErrors.osm.fetchFailure)
    })
  
    test('should handle valid XML response and extract display name correctly', async () => {
      const mockXML = `<osm><user display_name="John Doe"></user></osm>`
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXML),
      })
  
      const user = await fetchOSMUser('12345')
      expect(user).toEqual({ id: '12345', displayName: 'John Doe' })
    })
  
    test('should return null for displayName if display_name is not found in XML', async () => {
      const mockXML = `<osm><user></user></osm>`
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXML),
      })
  
      const user = await fetchOSMUser('12345')
      expect(user).toEqual({ id: '12345', displayName: null })
    })
  
    test('should handle empty XML response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      })
  
      const user = await fetchOSMUser('12345')
      expect(user).toEqual({ id: '12345', displayName: null })
    })
  
    test('should handle malformed XML gracefully', async () => {
      const mockXML = `<osm><user display_name="John Doe">`
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXML),
      })
  
      const user = await fetchOSMUser('12345')
      expect(user).toEqual({ id: '12345', displayName: 'John Doe' })
    })
  
    test('should return {} for non-200 and non-404 status codes with empty response', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 404 })
  
      const user = await fetchOSMUser('12345')
      expect(user).toEqual({})
    })
  })
})
