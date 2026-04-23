import { useEffect, useId, useMemo } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { Layer, Source } from 'react-map-gl/maplibre'
import { logger } from '@/lib/logger'
import type { Challenge } from '@/types/Challenge'
import { useMapListHover } from '../contexts/MapListHoverContext'
import { getChallengeFeaturedBadgeLayer, getChallengePointLayer } from './challengeMarkerStyles'

export const CHALLENGE_MARKERS_SOURCE_ID = 'explore-challenges-markers'
export const CHALLENGE_MARKERS_LAYER_ID = 'explore-challenges-markers-layer'
export const CHALLENGE_FEATURED_BADGE_LAYER_ID = 'explore-challenges-markers-featured-badge'

interface ChallengePoint {
  challengeId: number
  lng: number
  lat: number
}

const parseChallengeCentroid = (challenge: Challenge): ChallengePoint | null => {
  const rawLocation = challenge.location
  if (!rawLocation) return null

  try {
    const geo =
      typeof rawLocation === 'string'
        ? (JSON.parse(rawLocation) as GeoJSON.Geometry)
        : (rawLocation as unknown as GeoJSON.Geometry)

    if (!geo || typeof geo !== 'object') return null

    if (geo.type === 'Point' && Array.isArray(geo.coordinates)) {
      const [lng, lat] = geo.coordinates as [number, number]
      if (typeof lng === 'number' && typeof lat === 'number') {
        return { challengeId: challenge.id, lng, lat }
      }
    }

    // Polygon / MultiPolygon — compute a simple centroid so the marker has
    // a stable anchor point; the polygon itself is rendered separately when
    // the user explicitly searches a location.
    if (geo.type === 'Polygon' && Array.isArray(geo.coordinates)) {
      const ring = (geo.coordinates as number[][][])[0]
      if (!ring || ring.length === 0) return null
      let sumLng = 0
      let sumLat = 0
      for (const pt of ring) {
        sumLng += pt[0]
        sumLat += pt[1]
      }
      return { challengeId: challenge.id, lng: sumLng / ring.length, lat: sumLat / ring.length }
    }
  } catch (error) {
    logger.warn('Failed to parse challenge location geometry', {
      challengeId: challenge.id,
      error: String(error),
    })
  }
  return null
}

interface ChallengeMarkersLayerProps {
  mapRef: React.RefObject<MapRef | null>
  mapLoaded: boolean
  challenges: Challenge[]
}

export const ChallengeMarkersLayer = ({
  mapRef,
  mapLoaded,
  challenges,
}: ChallengeMarkersLayerProps) => {
  const { hoveredChallengeId } = useMapListHover()
  const sourceId = useId()

  // Stable FeatureCollection keyed to challenges content; markers rebuild when
  // the challenge set changes but not on unrelated renders.
  const featureCollection = useMemo<GeoJSON.FeatureCollection>(() => {
    const features: GeoJSON.Feature[] = []
    for (const challenge of challenges) {
      const parsed = parseChallengeCentroid(challenge)
      if (!parsed) continue
      features.push({
        type: 'Feature',
        id: challenge.id,
        geometry: { type: 'Point', coordinates: [parsed.lng, parsed.lat] },
        properties: {
          challengeId: challenge.id,
          name: challenge.name,
          difficulty: challenge.difficulty,
          featured: challenge.featured === true,
        },
      })
    }
    return { type: 'FeatureCollection', features }
  }, [challenges])

  // Update MapLibre feature-state when the hovered challenge changes; this
  // lets the marker paint react without rebuilding the source.
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return

    // Clear previous hover state (cheap — only iterates currently-hovered ids).
    try {
      map.removeFeatureState({ source: CHALLENGE_MARKERS_SOURCE_ID })
    } catch (error) {
      // Source may not be loaded yet; ignore but note.
      logger.debug('Clearing challenge marker hover state failed', { error: String(error) })
    }

    if (hoveredChallengeId != null) {
      try {
        map.setFeatureState(
          { source: CHALLENGE_MARKERS_SOURCE_ID, id: hoveredChallengeId },
          { hovered: true }
        )
      } catch (error) {
        logger.debug('Setting challenge marker hover state failed', {
          challengeId: hoveredChallengeId,
          error: String(error),
        })
      }
    }
  }, [hoveredChallengeId, mapLoaded, mapRef])

  // sourceId is generated only to appease React key hygiene; the real source
  // id passed to MapLibre is the stable constant used for feature-state.
  void sourceId

  const circleLayer = getChallengePointLayer(
    CHALLENGE_MARKERS_LAYER_ID,
    CHALLENGE_MARKERS_SOURCE_ID
  )
  const badgeLayer = getChallengeFeaturedBadgeLayer(
    CHALLENGE_FEATURED_BADGE_LAYER_ID,
    CHALLENGE_MARKERS_SOURCE_ID
  )

  return (
    <Source
      id={CHALLENGE_MARKERS_SOURCE_ID}
      type="geojson"
      data={featureCollection}
      promoteId="challengeId"
    >
      <Layer {...circleLayer} />
      <Layer {...badgeLayer} />
    </Source>
  )
}
