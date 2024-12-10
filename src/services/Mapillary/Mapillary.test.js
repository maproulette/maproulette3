import {
    isMapillaryEnabled,
    fetchMapillaryImages,
    hasMoreMapillaryResults,
    nextMapillaryPage,
    mapillaryImageUrl,
    getAccessToken,
    imageCache,
} from './Mapillary'

const mockFetch = vitest.fn()
global.fetch = mockFetch

describe('Mapillary Service Functions', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    console.error.mockRestore()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.REACT_APP_MAPILLARY_CLIENT_TOKEN = 'mockToken'
  })

  afterEach(() => {
    delete process.env.REACT_APP_MAPILLARY_CLIENT_TOKEN
    imageCache.clear()
  })

  describe('isMapillaryEnabled', () => {
    it('should return true if the Mapillary client token is set', () => {
      expect(isMapillaryEnabled()).toBe(true)
    })

    it('should return false if the Mapillary client token is not set', () => {
      delete process.env.REACT_APP_MAPILLARY_CLIENT_TOKEN
      expect(isMapillaryEnabled()).toBe(false)
    })
  })

  describe('fetchMapillaryImages', () => {
    it('should throw an error if Mapillary is not enabled', async () => {
      delete process.env.REACT_APP_MAPILLARY_CLIENT_TOKEN
      await expect(fetchMapillaryImages('0,0,1,1')).rejects.toThrow("Missing Mapillary client token")
    })

    it('should handle invalid bbox input gracefully', async () => {
      await expect(fetchMapillaryImages(null)).rejects.toThrow('Unable to fetch Mapillary images. Please try again.')
    })
  })

  describe('hasMoreMapillaryResults', () => {
    it('should return false if there is no next page', () => {
      const resultContext = { link: '' }
      expect(hasMoreMapillaryResults(resultContext)).toBe(false)
    })
  })

  describe('nextMapillaryPage', () => {
    it('should return null if there is no next page', async () => {
      const resultContext = { link: '' }
      const result = await nextMapillaryPage(resultContext)
      expect(result).toBeNull()
    })
  })

  describe('mapillaryImageUrl', () => {
    it('should generate the correct Mapillary image URL', () => {
      const imageId = 'abc123'
      const expectedUrl = `https://www.mapillary.com/embed?image_key=${imageId}`
      expect(mapillaryImageUrl(imageId)).toBe(expectedUrl)
    })
  })

  describe('getAccessToken', () => {
    it('should return the access token', () => {
      expect(getAccessToken()).toBe(process.env.REACT_APP_MAPILLARY_CLIENT_TOKEN)
    })
  })
})
