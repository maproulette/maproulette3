import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Project } from '@/types/Project'

const { loaderDataRef } = vi.hoisted(() => ({
  loaderDataRef: { current: { project: { id: 1, name: 'placeholder' } as Project } },
}))

vi.mock('@tanstack/react-router', () => ({
  useLoaderData: () => loaderDataRef.current,
}))

import { BrowsedProjectProvider, useBrowsedProjectContext } from './BrowsedProjectContext'

describe('BrowsedProjectContext', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws when used outside of a BrowsedProjectProvider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useBrowsedProjectContext())).toThrow(
      'useBrowsedProject must be used within a BrowsedProjectProvider'
    )

    consoleErrorSpy.mockRestore()
  })

  it('exposes the project returned by the route loader', () => {
    loaderDataRef.current = { project: { id: 42, name: 'Test Project' } as Project }

    const { result } = renderHook(() => useBrowsedProjectContext(), {
      wrapper: BrowsedProjectProvider,
    })

    expect(result.current.project).toEqual({ id: 42, name: 'Test Project' })
  })

  it('reflects a new project when the loader data changes between renders', () => {
    loaderDataRef.current = { project: { id: 1, name: 'First' } as Project }

    const { result, rerender } = renderHook(() => useBrowsedProjectContext(), {
      wrapper: BrowsedProjectProvider,
    })
    expect(result.current.project.name).toBe('First')

    loaderDataRef.current = { project: { id: 2, name: 'Second' } as Project }
    rerender()

    expect(result.current.project.id).toBe(2)
    expect(result.current.project.name).toBe('Second')
  })

  it('keeps a stable context value reference across re-renders when the project is unchanged', () => {
    const project = { id: 1, name: 'Stable' } as Project
    loaderDataRef.current = { project }

    const { result, rerender } = renderHook(() => useBrowsedProjectContext(), {
      wrapper: BrowsedProjectProvider,
    })
    const firstValue = result.current

    rerender()

    // Reason: the provider memoizes the context value on `project`, so an
    // unrelated re-render with the same project reference must not produce a
    // new context object (this is what prevents all consumers from
    // re-rendering unnecessarily).
    expect(result.current).toBe(firstValue)
  })

  it('produces a new context value when the project reference changes, even with equal contents', () => {
    loaderDataRef.current = { project: { id: 1, name: 'Same Content' } as Project }

    const { result, rerender } = renderHook(() => useBrowsedProjectContext(), {
      wrapper: BrowsedProjectProvider,
    })
    const firstValue = result.current

    loaderDataRef.current = { project: { id: 1, name: 'Same Content' } as Project }
    rerender()

    expect(result.current).not.toBe(firstValue)
    expect(result.current).toEqual(firstValue)
  })
})
