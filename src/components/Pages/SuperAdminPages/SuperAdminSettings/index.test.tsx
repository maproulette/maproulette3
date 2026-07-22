import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { SuperAdminSettings } from './index'

afterEach(() => cleanup())

describe('SuperAdminSettings', () => {
  it('renders the page header and every settings section', () => {
    render(<SuperAdminSettings />)

    expect(screen.getByRole('heading', { name: 'Platform Settings' })).toBeDefined()
    expect(screen.getByText('General Settings')).toBeDefined()
    expect(screen.getByText('Email Settings')).toBeDefined()
    expect(screen.getByText('Security Settings')).toBeDefined()
    expect(screen.getByText('Database Settings')).toBeDefined()
    expect(screen.getByText('Notification Settings')).toBeDefined()
    expect(screen.getByText('Appearance Settings')).toBeDefined()
  })

  it('pre-fills general settings fields with sensible defaults', () => {
    render(<SuperAdminSettings />)

    expect(screen.getByLabelText('Site Name')).toHaveProperty('value', 'MapRoulette')
    expect(screen.getByLabelText('Site Description')).toHaveProperty(
      'value',
      'A platform for collaborative mapping and data validation'
    )
    expect(screen.getByLabelText('Site URL')).toHaveProperty('value', 'https://maproulette.org')
  })

  it('pre-fills email settings fields with sensible defaults', () => {
    render(<SuperAdminSettings />)

    expect(screen.getByLabelText('SMTP Host')).toHaveProperty('value', 'smtp.example.com')
    expect(screen.getByLabelText('SMTP Port')).toHaveProperty('value', '587')
    expect(screen.getByLabelText('From Email Address')).toHaveProperty(
      'value',
      'noreply@maproulette.org'
    )
  })

  it('pre-fills database settings fields with sensible defaults', () => {
    render(<SuperAdminSettings />)

    expect(screen.getByLabelText('Database Host')).toHaveProperty('value', 'localhost')
    expect(screen.getByLabelText('Database Port')).toHaveProperty('value', '5432')
  })

  it('defaults switches to their expected checked state', () => {
    render(<SuperAdminSettings />)

    expect(
      screen.getByRole('switch', { name: 'Maintenance Mode' }).getAttribute('aria-checked')
    ).toBe('false')
    expect(
      screen
        .getByRole('switch', { name: 'Enable Email Notifications' })
        .getAttribute('aria-checked')
    ).toBe('true')
    expect(
      screen
        .getByRole('switch', { name: 'Enable Two-Factor Authentication' })
        .getAttribute('aria-checked')
    ).toBe('true')
    expect(
      screen.getByRole('switch', { name: 'Automatic Backups' }).getAttribute('aria-checked')
    ).toBe('true')
    expect(
      screen.getByRole('switch', { name: 'New Project Notifications' }).getAttribute('aria-checked')
    ).toBe('false')
    expect(
      screen.getByRole('switch', { name: 'Default to Dark Mode' }).getAttribute('aria-checked')
    ).toBe('false')
  })

  it('toggles a switch on click', async () => {
    const user = userEvent.setup()
    render(<SuperAdminSettings />)

    const maintenanceSwitch = screen.getByRole('switch', { name: 'Maintenance Mode' })
    expect(maintenanceSwitch.getAttribute('aria-checked')).toBe('false')

    await user.click(maintenanceSwitch)
    expect(maintenanceSwitch.getAttribute('aria-checked')).toBe('true')

    await user.click(maintenanceSwitch)
    expect(maintenanceSwitch.getAttribute('aria-checked')).toBe('false')
  })

  it('allows editing the site name field', async () => {
    const user = userEvent.setup()
    render(<SuperAdminSettings />)

    const siteNameInput = screen.getByLabelText('Site Name')
    await user.clear(siteNameInput)
    await user.type(siteNameInput, 'My Custom Platform')

    expect(siteNameInput).toHaveProperty('value', 'My Custom Platform')
  })

  it('renders the database maintenance actions and the save button', () => {
    render(<SuperAdminSettings />)

    expect(screen.getByRole('button', { name: 'Run Maintenance' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Create Backup' })).toBeDefined()
    expect(screen.getByRole('button', { name: /Save All Settings/ })).toBeDefined()
  })
})
