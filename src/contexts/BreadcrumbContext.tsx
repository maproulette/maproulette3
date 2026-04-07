import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

export interface BreadcrumbSegment {
  label: string
  href: string
}

interface BreadcrumbContextValue {
  segments: BreadcrumbSegment[] | null
  setSegments: (segments: BreadcrumbSegment[] | null) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  segments: null,
  setSegments: () => {},
})

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const [segments, setSegments] = useState<BreadcrumbSegment[] | null>(null)

  return (
    <BreadcrumbContext.Provider value={{ segments, setSegments }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export const useBreadcrumbs = () => useContext(BreadcrumbContext).segments

export const useSetBreadcrumbs = (segments: BreadcrumbSegment[] | null) => {
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
