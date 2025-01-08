import React from 'react'
import { render } from '@testing-library/react'
import { MapContainer } from 'react-leaflet'
import ImageMarkerLayer from './ImageMarkerLayer'

describe('ImageMarkerLayer Component', () => {
  beforeAll(() => {
    vitest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    console.error.mockRestore()
  })

  const mockImages = [
    { key: 'image1', url: 'http://example.com/image1.jpg', position: { lat: 1, lon: 1 } },
    { key: 'image2', url: 'http://example.com/image2.jpg', position: { lat: 2, lon: 2 } },
  ]

  it('renders without crashing', () => {
    const { container } = render(
      <MapContainer>
        <ImageMarkerLayer images={mockImages} />
      </MapContainer>
    )
    expect(container).toBeInTheDocument()
  })
})
