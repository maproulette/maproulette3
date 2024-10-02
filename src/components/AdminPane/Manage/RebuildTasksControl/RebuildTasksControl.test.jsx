import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { RebuildTasksControl } from './RebuildTasksControl'
import { act } from 'react-dom/test-utils'

jest.mock('../../../../interactions/Challenge/AsManageableChallenge', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((challenge) => ({
    ...challenge,
    dataSource: () => 'local',
  })),
}))

describe('RebuildTasksControl', () => {
  let props

  beforeEach(() => {
    props = {
      challenge: {
        id: 1,
        dataOriginDate: '2024-01-01',
      },
      recordSnapshot: jest.fn(),
      deleteIncompleteTasks: jest.fn(),
      rebuildChallenge: jest.fn(),
      refreshChallenge: jest.fn(),
      intl: {
        formatMessage: jest.fn().mockImplementation(({ id }) => id),
        formatDate: jest.fn(),
      },
    }
  })

  const renderComponent = (additionalProps = {}) => {
    return render(
      <IntlProvider locale="en">
        <RebuildTasksControl {...props} {...additionalProps} />
        <div>Test Passes</div>
      </IntlProvider>
    )
  }

  it("doesn't break if only required props are provided", () => {
    renderComponent()
    expect(screen.getByText("Test Passes")).toBeInTheDocument()
  })

  it('shows the modal when the control is clicked', () => {
    renderComponent()
    fireEvent.click(screen.getByText(/Rebuild Tasks/i))
    expect(screen.getByText(/Rebuild Challenge Tasks/i)).toBeInTheDocument()
  })

  it('hides the modal when cancel button is clicked', async () => {
    renderComponent()
    fireEvent.click(screen.getByText(/Rebuild Tasks/i))
    fireEvent.click(screen.getByText(/Cancel/i))
    await waitFor(() => {
      expect(screen.queryByText(/Rebuild Challenge Tasks/i)).not.toBeInTheDocument()
    })
  })

  it('handles file upload correctly', async () => {
    const { container } = renderComponent()
    fireEvent.click(screen.getByText(/Rebuild Tasks/i))

    await act(async () => {
      const fileInput = container.querySelector('input[type="file"]')
      if (fileInput) {
        const file = new File(['test content'], 'test.geojson', { type: 'application/geojson' })
        Object.defineProperty(fileInput, 'files', {
          value: [file],
          configurable: true,
        })
        fireEvent.change(fileInput)
      }
    })

    await waitFor(() => {
      expect(screen.getByText('test.geojson')).toBeInTheDocument()
    })
  })

  it('handles checkbox change correctly and calls proceed function when checked', async () => {
    const { rebuildChallenge, deleteIncompleteTasks, recordSnapshot, refreshChallenge } = props
    renderComponent()

    fireEvent.click(screen.getByText(/Rebuild Tasks/i))
    const checkbox = screen.getByLabelText(/First remove incomplete tasks/i)
    expect(checkbox.checked).toBe(false)

    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)

    await act(async () => {
      fireEvent.click(screen.getByText(/Proceed/i))
    })

    await waitFor(() => {
      expect(recordSnapshot).toHaveBeenCalledWith(props.challenge.id)
      expect(rebuildChallenge).toHaveBeenCalledWith(props.challenge, null, '2024-01-01')
      expect(deleteIncompleteTasks).toHaveBeenCalledWith(props.challenge)
      expect(refreshChallenge).toHaveBeenCalled()
    })
  })

  it('handles checkbox change correctly and calls proceed function when not checked', async () => {
    const { rebuildChallenge, deleteIncompleteTasks, recordSnapshot, refreshChallenge } = props
    renderComponent()

    fireEvent.click(screen.getByText(/Rebuild Tasks/i))
    const checkbox = screen.getByLabelText(/First remove incomplete tasks/i)
    expect(checkbox.checked).toBe(false)

    await act(async () => {
      fireEvent.click(screen.getByText(/Proceed/i))
    })

    await waitFor(() => {
      expect(recordSnapshot).toHaveBeenCalledWith(props.challenge.id)
      expect(rebuildChallenge).toHaveBeenCalledWith(props.challenge, null, '2024-01-01')
      expect(deleteIncompleteTasks).not.toHaveBeenCalled()
      expect(refreshChallenge).toHaveBeenCalled()
    })
  })

  it('logs an error during proceed if an error occurs', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    props.rebuildChallenge = jest.fn().mockImplementation(() => {
      throw new Error('Simulated error')
    })

    renderComponent()

    fireEvent.click(screen.getByText(/Rebuild Tasks/i))

    await act(async () => {
      fireEvent.click(screen.getByText(/Proceed/i))
    })

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error during proceed:', expect.any(Error))
    })

    consoleError.mockRestore()
  })

  it('updates state when input value changes', async () => {
    renderComponent()

    fireEvent.click(screen.getByText(/Rebuild Tasks/i))

    const inputField = screen.getByLabelText(/Date data was sourced/i)

    fireEvent.change(inputField, { target: { value: '2024-12-31' } })

    await screen.findByDisplayValue('2024-12-31')

    expect(inputField.value).toBe('2024-12-31')
  })
})
