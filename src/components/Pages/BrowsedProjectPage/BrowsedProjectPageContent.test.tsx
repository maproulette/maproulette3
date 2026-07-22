import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'

const { loaderDataRef, useSetPageTitleContextMock } = vi.hoisted(() => ({
  loaderDataRef: { current: { project: {} as { displayName?: string; name?: string } } },
  useSetPageTitleContextMock: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useLoaderData: () => loaderDataRef.current,
}))

vi.mock('@/contexts/PageTitleContext', () => ({
  useSetPageTitleContext: useSetPageTitleContextMock,
}))

vi.mock('./ChallengesList', () => ({
  ChallengesList: () => <div data-testid="challenges-list-stub" />,
}))

vi.mock('./ProjectDetail', () => ({
  ProjectDetail: () => <div data-testid="project-detail-stub" />,
}))

import { BrowsedProjectPageContent } from './BrowsedProjectPageContent'

afterEach(() => cleanup())

beforeEach(() => {
  vi.clearAllMocks()
})

describe('BrowsedProjectPageContent', () => {
  it('renders both the project detail panel and the challenges list panel', () => {
    loaderDataRef.current = { project: { displayName: 'Roads Project' } }

    render(<BrowsedProjectPageContent />)

    expect(screen.getByTestId('project-detail-stub')).toBeDefined()
    expect(screen.getByTestId('challenges-list-stub')).toBeDefined()
  })

  it('sets the page title to the project display name when present', () => {
    loaderDataRef.current = { project: { displayName: 'Roads Project', name: 'roads' } }

    render(<BrowsedProjectPageContent />)

    expect(useSetPageTitleContextMock).toHaveBeenCalledWith('Roads Project')
  })

  it('falls back to the internal project name when there is no display name', () => {
    loaderDataRef.current = { project: { name: 'roads-internal' } }

    render(<BrowsedProjectPageContent />)

    expect(useSetPageTitleContextMock).toHaveBeenCalledWith('roads-internal')
  })

  it('sets the page title to null when neither a display name nor a name is available', () => {
    loaderDataRef.current = { project: {} }

    render(<BrowsedProjectPageContent />)

    expect(useSetPageTitleContextMock).toHaveBeenCalledWith(null)
  })
})
