import { fetchOpenStreetCamImages } from './OpenStreetCam'

describe('OpenStreetCam Service Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.REACT_APP_IMAGERY_OPENSTREETCAM = 'enabled'
  })

  it('should throw an error if OpenStreetCam is not enabled', async () => {
    process.env.REACT_APP_IMAGERY_OPENSTREETCAM = 'disabled'
    await expect(fetchOpenStreetCamImages('0,0,1,1')).rejects.toThrow("OpenStreetCam is not enabled")
  })

  it('should fetch OpenStreetCam images correctly', async () => {
    const mockResponse = { currentPageItems: [], totalFilteredItems: [0] }
    const mockFetch = jest.fn().mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue(mockResponse) })
    global.fetch = mockFetch

    const result = await fetchOpenStreetCamImages('0,0,1,1')
    expect(result.currentPageItems).toEqual([])
    expect(mockFetch).toHaveBeenCalled()
  })
})
