import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { ProfilePageProvider, useProfilePageContext } from './contexts/ProfilePageContext'
import { TimeRangeSelector } from './TimeRangeSelector'

afterEach(() => cleanup())

const CurrentMonthDuration = () => {
  const { timeRange } = useProfilePageContext()
  return <output data-testid="current-duration">{timeRange.monthDuration}</output>
}

const renderSelector = () =>
  render(
    <ProfilePageProvider userId={1}>
      <TimeRangeSelector />
      <CurrentMonthDuration />
    </ProfilePageProvider>
  )

const checkedState = (el: HTMLElement) => el.getAttribute('aria-checked')

describe('TimeRangeSelector', () => {
  it('renders every time range preset', () => {
    renderSelector()

    expect(screen.getByRole('radio', { name: '1m' })).toBeDefined()
    expect(screen.getByRole('radio', { name: '3m' })).toBeDefined()
    expect(screen.getByRole('radio', { name: '6m' })).toBeDefined()
    expect(screen.getByRole('radio', { name: '9m' })).toBeDefined()
    expect(screen.getByRole('radio', { name: '12m' })).toBeDefined()
    expect(screen.getByRole('radio', { name: 'All' })).toBeDefined()
  })

  it('defaults to the "All" preset selected', () => {
    renderSelector()

    expect(checkedState(screen.getByRole('radio', { name: 'All' }))).toBe('true')
    expect(screen.getByTestId('current-duration').textContent).toBe('-1')
  })

  it('selecting a preset updates the context value and the pressed state', async () => {
    const user = userEvent.setup()
    renderSelector()

    await user.click(screen.getByRole('radio', { name: '6m' }))

    expect(checkedState(screen.getByRole('radio', { name: '6m' }))).toBe('true')
    expect(checkedState(screen.getByRole('radio', { name: 'All' }))).toBe('false')
    expect(screen.getByTestId('current-duration').textContent).toBe('6')
  })

  it('supports switching between multiple presets in sequence', async () => {
    const user = userEvent.setup()
    renderSelector()

    await user.click(screen.getByRole('radio', { name: '3m' }))
    expect(screen.getByTestId('current-duration').textContent).toBe('3')

    await user.click(screen.getByRole('radio', { name: '12m' }))
    expect(screen.getByTestId('current-duration').textContent).toBe('12')
    expect(checkedState(screen.getByRole('radio', { name: '3m' }))).toBe('false')
  })

  it('clicking the already-selected preset keeps it selected (toggle group does not deselect to empty)', async () => {
    const user = userEvent.setup()
    renderSelector()

    await user.click(screen.getByRole('radio', { name: 'All' }))

    expect(screen.getByTestId('current-duration').textContent).toBe('-1')
    expect(checkedState(screen.getByRole('radio', { name: 'All' }))).toBe('true')
  })
})
