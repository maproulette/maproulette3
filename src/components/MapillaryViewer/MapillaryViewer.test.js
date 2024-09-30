import React from 'react'
import { render } from '@testing-library/react'
import MapillaryViewer from './MapillaryViewer'

jest.mock('mapillary-js', () => {
    return {
        Viewer: jest.fn().mockImplementation(() => ({
            setImageId: jest.fn(),
            remove: jest.fn(),
        })),
    }
})

describe('MapillaryViewer Component', () => {
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
        console.error.mockRestore()
    })

    it('renders without crashing', () => {
        const { container } = render(<MapillaryViewer initialImageKey="abc123" />)
        expect(container).toBeInTheDocument()
    })
})
