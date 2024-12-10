import React from 'react'
import { render } from '@testing-library/react'
import MapillaryViewer from './MapillaryViewer'

vitest.mock('mapillary-js', () => { 
  return {
    Viewer: vitest.fn().mockImplementation(() => ({
      setImageId: vitest.fn(),
      remove: vitest.fn(),
    })),
  }
})

describe('MapillaryViewer Component', () => {
  beforeAll(() => {
    vitest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    console.error.mockRestore()
  })

  it('renders without crashing', () => {
    const { container } = render(<MapillaryViewer initialImageKey="abc123" />)
    expect(container).toBeInTheDocument()
  })
})
