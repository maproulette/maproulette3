import { useMapPolygon } from '@/components/ExploreChallengesPage/hooks/useMapPolygon'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import { useExploreChallengesMapContext } from './ExploreChallengesMapContext'

/**
 * Component that manages the location polygon on the map.
 * This is a thin wrapper around the useMapPolygon hook.
 */
export const LocationPolygon = () => {
  const { map, mapLoaded } = useExploreChallengesMapContext()
  const { locationGeojson } = useExploreChallengesSearchContext()

  useMapPolygon({
    map,
    mapLoaded,
    locationGeojson,
  })

  return null
}
