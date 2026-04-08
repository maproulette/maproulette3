import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

export interface BreadcrumbSegment {
  label: string
  href: string
}

interface BreadcrumbContextType {
  segments: BreadcrumbSegment[] | null
  setSegments: (segments: BreadcrumbSegment[] | null) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  segments: null,
  setSegments: () => {},
})

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const [segments, setSegments] = useState<BreadcrumbSegment[] | null>(null)

  // Reason: context value must be stable to prevent all consumers from re-rendering
  const value = useMemo(() => ({ segments, setSegments }), [segments, setSegments])

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>
}

export const useBreadcrumbContext = () => useContext(BreadcrumbContext).segments

export const useSetBreadcrumbContext = (segments: BreadcrumbSegment[] | null) => {
  const { setSegments } = useContext(BreadcrumbContext)
  const segmentsRef = useRef(segments)
  segmentsRef.current = segments

  useEffect(() => {
    setSegments(segmentsRef.current)
    return () => setSegments(null)
  }, [setSegments])

  // Update when segments change (stringified comparison to avoid infinite loops)
  const serialized = JSON.stringify(segments)
  useEffect(() => {
    setSegments(segmentsRef.current)
  }, [serialized, setSegments])
}
