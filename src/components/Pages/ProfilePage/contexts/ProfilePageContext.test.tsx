import { act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from '@/test/testUtils'
import { ProfilePageProvider, useProfilePageContext } from './ProfilePageContext'

describe('ProfilePageContext', () => {
  it('exposes the userId and a default timeRange of "all" (monthDuration -1)', () => {
    const { result } = renderHook(() => useProfilePageContext(), {
      wrapper: ({ children }) => <ProfilePageProvider userId={42}>{children}</ProfilePageProvider>,
    })

    expect(result.current.userId).toBe(42)
    expect(result.current.timeRange).toEqual({ monthDuration: -1 })
  })

  it('updates the timeRange when setMonthDuration is called', () => {
    const { result } = renderHook(() => useProfilePageContext(), {
      wrapper: ({ children }) => <ProfilePageProvider userId={7}>{children}</ProfilePageProvider>,
    })

    act(() => {
      result.current.setMonthDuration(3)
    })

    expect(result.current.timeRange).toEqual({ monthDuration: 3 })
  })

  it('supports transitioning between multiple time ranges', () => {
    const { result } = renderHook(() => useProfilePageContext(), {
      wrapper: ({ children }) => <ProfilePageProvider userId={7}>{children}</ProfilePageProvider>,
    })

    act(() => result.current.setMonthDuration(6))
    expect(result.current.timeRange.monthDuration).toBe(6)

    act(() => result.current.setMonthDuration(12))
    expect(result.current.timeRange.monthDuration).toBe(12)

    act(() => result.current.setMonthDuration(-1))
    expect(result.current.timeRange.monthDuration).toBe(-1)
  })

  it('exposes whichever userId the provider was created with', () => {
    const { result: resultA } = renderHook(() => useProfilePageContext(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ProfilePageProvider userId={1}>{children}</ProfilePageProvider>
      ),
    })
    expect(resultA.current.userId).toBe(1)

    const { result: resultB } = renderHook(() => useProfilePageContext(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ProfilePageProvider userId={99}>{children}</ProfilePageProvider>
      ),
    })
    expect(resultB.current.userId).toBe(99)
  })

  it('throws a helpful error when used outside of a ProfilePageProvider', () => {
    expect(() => {
      renderHook(() => useProfilePageContext())
    }).toThrow('useProfilePageContext must be used within ProfilePageProvider')
  })
})
