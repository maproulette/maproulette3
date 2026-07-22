import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useBrowsedProjectContext } from '@/components/Pages/BrowsedProjectPage/contexts/BrowsedProjectContext'
import { cleanup, render, screen } from '@/test/testUtils'
import type { Project } from '@/types/Project'

const { loaderDataRef } = vi.hoisted(() => ({
  loaderDataRef: { current: { project: { id: 1, name: 'placeholder' } as Project } },
}))

vi.mock('@tanstack/react-router', () => ({
  useLoaderData: () => loaderDataRef.current,
}))

// Stand in for the real content component so this test focuses purely on
// whether `BrowsedProjectPage` wires the provider up correctly: any consumer
// nested inside it should be able to read the project supplied by the route
// loader via `useBrowsedProjectContext`.
vi.mock('./BrowsedProjectPageContent', () => ({
  BrowsedProjectPageContent: () => {
    const { project } = useBrowsedProjectContext()
    return <div data-testid="content-stub">{project.displayName ?? project.name}</div>
  },
}))

import { BrowsedProjectPage } from './index'

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
})

describe('BrowsedProjectPage', () => {
  it('wraps the content in a BrowsedProjectProvider so descendants can read the loader project', () => {
    loaderDataRef.current = {
      project: { id: 7, name: 'roads', displayName: 'Roads Project' } as Project,
    }

    render(<BrowsedProjectPage />)

    expect(screen.getByTestId('content-stub')).toBeDefined()
    expect(screen.getByText('Roads Project')).toBeDefined()
  })

  it('reflects a different project when the loader returns different data', () => {
    loaderDataRef.current = {
      project: { id: 2, name: 'bridges', displayName: undefined } as Project,
    }

    render(<BrowsedProjectPage />)

    expect(screen.getByText('bridges')).toBeDefined()
  })
})
