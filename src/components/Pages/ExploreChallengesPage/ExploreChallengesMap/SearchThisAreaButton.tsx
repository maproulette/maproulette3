import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { boundsAreEqual, getMapBoundsString } from '@/components/Map/mapUtils'
import { Button } from '@/components/ui/Button'
import { useIntl } from '@/i18n'
import { useExploreChallengesSearchContext } from '../contexts/ExploreChallengesSearchContext'

interface SearchThisAreaButtonProps {
  mapRef: React.RefObject<MapRef | null>
  mapLoaded: boolean
}

/**
 * Floating "Search this area" button that appears when the user has panned or
 * zoomed such that the current map viewport differs from the bounds used for
 * the active query. Clicking applies the current viewport bounds, which
 * triggers the challenge search to re-run via context state.
 */
export const SearchThisAreaButton = ({ mapRef, mapLoaded }: SearchThisAreaButtonProps) => {
  const { t } = useIntl()
  const { bounds, setBounds } = useExploreChallengesSearchContext()
  const [viewportBounds, setViewportBounds] = useState<string | null>(null)

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return

    const updateViewport = () => {
      setViewportBounds(getMapBoundsString(map))
    }

    updateViewport()
    map.on('moveend', updateViewport)
    map.on('zoomend', updateViewport)

    return () => {
      map.off('moveend', updateViewport)
      map.off('zoomend', updateViewport)
    }
  }, [mapLoaded, mapRef])

  const shouldShow = viewportBounds != null && !boundsAreEqual(viewportBounds, bounds)

  if (!shouldShow) return null

  return (
    <div className="-translate-x-1/2 pointer-events-none absolute top-3 left-1/2 z-10">
      <Button
        type="button"
        size="sm"
        variant="default"
        onClick={() => {
          if (viewportBounds) setBounds(viewportBounds)
        }}
        className="pointer-events-auto shadow-lg"
      >
        <Search className="h-3.5 w-3.5" />
        {t('exploreChallenges.map.searchThisArea', undefined, 'Search this area')}
      </Button>
    </div>
  )
}
