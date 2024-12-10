import React from 'react'
import { render } from '@testing-library/react'
import OpenStreetCamViewer from './OpenStreetCamViewer'

describe('OpenStreetCamViewer Component', () => {
  beforeAll(() => {
    vitest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    console.error.mockRestore()
  })

  it('renders without crashing', () => {
    const { container } = render(<OpenStreetCamViewer initialImageKey="xyz456" />)
    expect(container).toBeInTheDocument()
  })
})
