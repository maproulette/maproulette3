import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_WORLD_BOUNDS } from '@/components/Map/mapUtils'
import { cleanup, render, screen, waitFor } from '@/test/testUtils'

const { useExploreChallengesSearchContextMock } = vi.hoisted(() => ({
  useExploreChallengesSearchContextMock: vi.fn(),
}))

vi.mock('@/components/Pages/ExploreChallengesPage/contexts/ExploreChallengesSearchContext', () => ({
  useExploreChallengesSearchContext: useExploreChallengesSearchContextMock,
}))

import { LocationSearchFilter } from './LocationSearchFilter'

const jsonResponse = (data: unknown) => ({ ok: true, json: () => Promise.resolve(data) })

const DEBOUNCE_WAIT_MS = 1100

const baseContext = () => ({
  locationOsmType: undefined as string | undefined,
  locationOsmId: undefined as number | undefined,
  isLocationLoading: false,
  setBounds: vi.fn(),
  setLocationOsm: vi.fn(),
  setIsLocationLoading: vi.fn(),
  setLocationGeojson: vi.fn(),
  requestFitBounds: vi.fn(),
  bounds: DEFAULT_WORLD_BOUNDS,
})

describe('LocationSearchFilter', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    useExploreChallengesSearchContextMock.mockReset()
    useExploreChallengesSearchContextMock.mockReturnValue(baseContext())
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('does not search until at least 3 characters have been typed', async () => {
    const user = userEvent.setup()
    render(<LocationSearchFilter />)

    await user.type(screen.getByPlaceholderText('Search location...'), 'ab')
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_WAIT_MS))

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('searches nominatim after the debounce once the query is long enough, and lists results', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse([
        { display_name: 'Paris, France', place_id: '1', osm_type: 'relation', osm_id: 71525 },
      ])
    )
    const user = userEvent.setup()
    render(<LocationSearchFilter />)

    await user.type(screen.getByPlaceholderText('Search location...'), 'Par')
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1), { timeout: 3000 })

    expect(fetchMock.mock.calls[0][0]).toContain('nominatim.openstreetmap.org/search')
    expect(fetchMock.mock.calls[0][0]).toContain('q=Par')
    expect(await screen.findByRole('option', { name: /Paris/ })).toBeTruthy()
  })

  it('shows a "no results" message when the search returns an empty array', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]))
    const user = userEvent.setup()
    render(<LocationSearchFilter />)

    await user.type(screen.getByPlaceholderText('Search location...'), 'zzz')

    expect(await screen.findByText(/No locations found/, undefined, { timeout: 3000 })).toBeTruthy()
  })

  it('shows a network error message when the fetch rejects', async () => {
    fetchMock.mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    render(<LocationSearchFilter />)

    await user.type(screen.getByPlaceholderText('Search location...'), 'zzz')

    expect(await screen.findByText(/Network error/, undefined, { timeout: 3000 })).toBeTruthy()
  })

  it('selecting a suggestion sets the OSM id/type and applies the returned bounds/geojson', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/search?format=json')) {
        return Promise.resolve(
          jsonResponse([
            { display_name: 'Paris, France', place_id: '1', osm_type: 'relation', osm_id: 71525 },
          ])
        )
      }
      return Promise.resolve(
        jsonResponse([
          {
            display_name: 'Paris, France',
            boundingbox: ['48.8', '48.9', '2.2', '2.4'],
            geojson: { type: 'Polygon', coordinates: [] },
          },
        ])
      )
    })
    const context = baseContext()
    useExploreChallengesSearchContextMock.mockReturnValue(context)
    const user = userEvent.setup()
    render(<LocationSearchFilter />)

    await user.type(screen.getByPlaceholderText('Search location...'), 'Par')
    const option = await screen.findByRole('option', { name: /Paris/ }, { timeout: 3000 })
    await user.click(option)

    expect(context.setLocationOsm).toHaveBeenCalledWith('R', 71525)
    await waitFor(() => expect(context.setBounds).toHaveBeenCalledWith('2.2,48.8,2.4,48.9'), {
      timeout: 3000,
    })
    expect(context.requestFitBounds).toHaveBeenCalledWith('2.2,48.8,2.4,48.9')
    expect(context.setLocationGeojson).toHaveBeenCalledWith({ type: 'Polygon', coordinates: [] })
  })

  it('the clear button resets the input, location, and bounds', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]))
    const context = baseContext()
    useExploreChallengesSearchContextMock.mockReturnValue(context)
    const user = userEvent.setup()
    render(<LocationSearchFilter />)

    const input = screen.getByPlaceholderText('Search location...')
    await user.type(input, 'zzz')
    await user.click(screen.getByLabelText('Clear location'))

    expect((input as HTMLInputElement).value).toBe('')
    expect(context.setLocationOsm).toHaveBeenCalledWith(undefined, undefined)
    expect(context.setBounds).toHaveBeenCalledWith(DEFAULT_WORLD_BOUNDS)
    expect(context.setLocationGeojson).toHaveBeenCalledWith(null)
  })

  it('ArrowDown highlights the next suggestion and Enter selects it', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/search?format=json')) {
        return Promise.resolve(
          jsonResponse([
            { display_name: 'Paris, France', place_id: '1', osm_type: 'relation', osm_id: 1 },
            { display_name: 'Parma, Italy', place_id: '2', osm_type: 'relation', osm_id: 2 },
          ])
        )
      }
      return Promise.resolve(jsonResponse([{ display_name: 'Parma, Italy' }]))
    })
    const context = baseContext()
    useExploreChallengesSearchContextMock.mockReturnValue(context)
    const user = userEvent.setup()
    render(<LocationSearchFilter />)

    const input = screen.getByPlaceholderText('Search location...')
    await user.type(input, 'Par')
    await screen.findByRole('option', { name: /Paris/ }, { timeout: 3000 })

    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')

    expect(context.setLocationOsm).toHaveBeenCalledWith('R', 2)
  })

  it('loads and applies an initial location from locationOsmType/locationOsmId on mount', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse([
        {
          display_name: 'Berlin, Germany',
          boundingbox: ['52.3', '52.6', '13.0', '13.7'],
          geojson: { type: 'Polygon', coordinates: [] },
        },
      ])
    )
    const context = { ...baseContext(), locationOsmType: 'R', locationOsmId: 62422 }
    useExploreChallengesSearchContextMock.mockReturnValue(context)

    render(<LocationSearchFilter />)

    await waitFor(
      () =>
        expect((screen.getByPlaceholderText('Search location...') as HTMLInputElement).value).toBe(
          'Berlin, Germany'
        ),
      { timeout: 3000 }
    )
    expect(fetchMock.mock.calls[0][0]).toContain('lookup?osm_ids=R62422')
    expect(context.setBounds).toHaveBeenCalledWith('13,52.3,13.7,52.6')
  })

  it('when initial bounds are already non-world, only applies geojson and skips re-fitting bounds', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse([
        {
          display_name: 'Berlin, Germany',
          boundingbox: ['52.3', '52.6', '13.0', '13.7'],
          geojson: { type: 'Polygon', coordinates: [] },
        },
      ])
    )
    const context = {
      ...baseContext(),
      locationOsmType: 'R',
      locationOsmId: 62422,
      bounds: '13,52.3,13.7,52.6',
    }
    useExploreChallengesSearchContextMock.mockReturnValue(context)

    render(<LocationSearchFilter />)

    await waitFor(() => expect(context.setLocationGeojson).toHaveBeenCalled(), { timeout: 3000 })
    expect(context.setBounds).not.toHaveBeenCalled()
    expect(context.requestFitBounds).not.toHaveBeenCalled()
  })
})
