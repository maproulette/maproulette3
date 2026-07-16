import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TaskMarker } from '@/types/Task'

const { useTaskMapContextMock } = vi.hoisted(() => ({
  useTaskMapContextMock: vi.fn(),
}))

vi.mock('@/components/Pages/TaskEditPage/contexts/TaskMapContext', () => ({
  useTaskMapContext: useTaskMapContextMock,
}))

import { useMarkerVisibility } from './useMarkerVisibility'

const marker = { id: 1 } as unknown as TaskMarker

interface ContextOverrides {
  selectedMarker?: TaskMarker | null
  markersHidden?: boolean
  setMarkersHidden?: (hidden: boolean) => void
}

const setContext = ({
  selectedMarker = null,
  markersHidden = false,
  setMarkersHidden = vi.fn(),
}: ContextOverrides) => {
  useTaskMapContextMock.mockReturnValue({ selectedMarker, markersHidden, setMarkersHidden })
}

describe('useMarkerVisibility', () => {
  beforeEach(() => {
    useTaskMapContextMock.mockReset()
  })

  it('does nothing on initial mount when there is no selected marker', () => {
    const setMarkersHidden = vi.fn()
    setContext({ selectedMarker: null, markersHidden: false, setMarkersHidden })

    renderHook(() => useMarkerVisibility())

    expect(setMarkersHidden).not.toHaveBeenCalled()
  })

  it('does not reset markersHidden while a marker remains selected', () => {
    const setMarkersHidden = vi.fn()
    setContext({ selectedMarker: marker, markersHidden: true, setMarkersHidden })

    const { rerender } = renderHook(() => useMarkerVisibility())

    setContext({
      selectedMarker: { ...marker, id: 2 } as unknown as TaskMarker,
      markersHidden: true,
      setMarkersHidden,
    })
    rerender()

    expect(setMarkersHidden).not.toHaveBeenCalled()
  })

  it('resets markersHidden to false when the selected marker is cleared while markers are hidden', () => {
    const setMarkersHidden = vi.fn()
    setContext({ selectedMarker: marker, markersHidden: true, setMarkersHidden })

    const { rerender } = renderHook(() => useMarkerVisibility())

    setContext({ selectedMarker: null, markersHidden: true, setMarkersHidden })
    rerender()

    expect(setMarkersHidden).toHaveBeenCalledWith(false)
    expect(setMarkersHidden).toHaveBeenCalledTimes(1)
  })

  it('does not call setMarkersHidden when the selected marker is cleared but markers are already visible', () => {
    const setMarkersHidden = vi.fn()
    setContext({ selectedMarker: marker, markersHidden: false, setMarkersHidden })

    const { rerender } = renderHook(() => useMarkerVisibility())

    setContext({ selectedMarker: null, markersHidden: false, setMarkersHidden })
    rerender()

    expect(setMarkersHidden).not.toHaveBeenCalled()
  })

  it('does not fire when selectedMarker stays null across renders', () => {
    const setMarkersHidden = vi.fn()
    setContext({ selectedMarker: null, markersHidden: true, setMarkersHidden })

    const { rerender } = renderHook(() => useMarkerVisibility())

    setContext({ selectedMarker: null, markersHidden: true, setMarkersHidden })
    rerender()

    expect(setMarkersHidden).not.toHaveBeenCalled()
  })
})
