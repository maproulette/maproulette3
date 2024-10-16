import React from 'react'
import { render } from '@testing-library/react'
import Modal from './Modal'

describe('Modal Component', () => {
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
        console.error.mockRestore()
    })

    it('renders without crashing', () => {
        const { container } = render(<Modal isActive={true} onClose={() => {}} />)
        expect(container).toBeInTheDocument()
    })

    it('displays the modal content', () => {
        const { getByText } = render(<Modal isActive={true} onClose={() => {}}>Modal Content</Modal>)
        expect(getByText(/modal content/i)).toBeInTheDocument()
    })
})
