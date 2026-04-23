import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'

export type HoverSource = 'list' | 'map' | null

interface MapListHoverState {
  hoveredChallengeId: number | null
  hoverSource: HoverSource
}

interface MapListHoverContextType extends MapListHoverState {
  setHoveredFromList: (challengeId: number | null) => void
  setHoveredFromMap: (challengeId: number | null) => void
  clearHover: () => void
}

const MapListHoverContext = createContext<MapListHoverContextType | undefined>(undefined)

export const MapListHoverProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<MapListHoverState>({
    hoveredChallengeId: null,
    hoverSource: null,
  })

  const value = useMemo<MapListHoverContextType>(
    () => ({
      hoveredChallengeId: state.hoveredChallengeId,
      hoverSource: state.hoverSource,
      setHoveredFromList: (challengeId) =>
        setState({ hoveredChallengeId: challengeId, hoverSource: challengeId ? 'list' : null }),
      setHoveredFromMap: (challengeId) =>
        setState({ hoveredChallengeId: challengeId, hoverSource: challengeId ? 'map' : null }),
      clearHover: () => setState({ hoveredChallengeId: null, hoverSource: null }),
    }),
    [state.hoveredChallengeId, state.hoverSource]
  )

  return <MapListHoverContext.Provider value={value}>{children}</MapListHoverContext.Provider>
}

export const useMapListHover = () => {
  const context = useContext(MapListHoverContext)
  if (context === undefined) {
    throw new Error('useMapListHover must be used within a MapListHoverProvider')
  }
  return context
}
