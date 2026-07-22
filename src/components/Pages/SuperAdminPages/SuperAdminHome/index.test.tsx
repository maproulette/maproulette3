import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'
import { SuperAdminHome } from './index'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children?: ReactNode }) => <a href={to}>{children}</a>,
}))

afterEach(() => cleanup())

describe('SuperAdminHome', () => {
  it('renders the dashboard header', () => {
    render(<SuperAdminHome />)

    expect(screen.getByRole('heading', { name: 'Super Admin Dashboard' })).toBeDefined()
    expect(screen.getByText('Manage all aspects of the MapRoulette platform.')).toBeDefined()
  })

  it('links each active card to its corresponding super-admin section', () => {
    render(<SuperAdminHome />)

    const links = screen.getAllByRole('link')
    const hrefsByLabel = (label: string) =>
      links.find((link) => link.textContent?.includes(label))?.getAttribute('href')

    expect(hrefsByLabel('View Users')).toBe('/super-admin/users')
    expect(hrefsByLabel('View Projects')).toBe('/super-admin/projects')
    expect(hrefsByLabel('View Challenges')).toBe('/super-admin/challenges')
    expect(hrefsByLabel('View Plugins')).toBe('/super-admin/plugins')
    expect(hrefsByLabel('View Analytics')).toBe('/super-admin/analytics')
    expect(hrefsByLabel('View Settings')).toBe('/super-admin/settings')
  })

  it('renders exactly six navigable cards, excluding the disabled Database card', () => {
    render(<SuperAdminHome />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(6)
    expect(links.some((link) => link.textContent?.includes('Database'))).toBe(false)
  })

  it('renders the Database card as disabled with a "Coming Soon" button and no link', () => {
    render(<SuperAdminHome />)

    expect(screen.getByText('Database')).toBeDefined()
    expect(screen.getByText('Database management and maintenance')).toBeDefined()

    const comingSoonButton = screen.getByRole('button', { name: 'Coming Soon' })
    expect(comingSoonButton.hasAttribute('disabled')).toBe(true)
  })
})
