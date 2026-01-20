import type { RefObject } from 'react'
import { useEffect, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'

type Anchor =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

interface UsePopupAnchorProps {
  mapRef: RefObject<MapRef | null>
  longitude: number
  latitude: number
  popupWidth?: number
  popupHeight?: number
}

export const usePopupAnchor = ({
  mapRef,
  longitude,
  latitude,
  popupWidth = 400,
  popupHeight = 500,
}: UsePopupAnchorProps): Anchor => {
  const [anchor, setAnchor] = useState<Anchor>('bottom')

  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current.getMap()
    if (!map) return

    const calculateAnchor = () => {
      try {
        const point = map.project([longitude, latitude])
        const mapContainer = map.getContainer()
        const containerRect = mapContainer.getBoundingClientRect()

        const viewportWidth = containerRect.width
        const viewportHeight = containerRect.height

        const spaceAbove = point.y
        const spaceBelow = viewportHeight - point.y
        const spaceLeft = point.x
        const spaceRight = viewportWidth - point.x

        const margin = 20
        const halfWidth = popupWidth / 2

        if (spaceAbove >= popupHeight + margin) {
          if (spaceLeft < halfWidth + margin) {
            setAnchor('bottom-left')
          } else if (spaceRight < halfWidth + margin) {
            setAnchor('bottom-right')
          } else {
            setAnchor('bottom')
          }
        } else if (spaceBelow >= popupHeight + margin) {
          if (spaceLeft < halfWidth + margin) {
            setAnchor('top-left')
          } else if (spaceRight < halfWidth + margin) {
            setAnchor('top-right')
          } else {
            setAnchor('top')
          }
        } else if (spaceRight >= popupWidth + margin) {
          setAnchor('left')
        } else if (spaceLeft >= popupWidth + margin) {
          setAnchor('right')
        } else {
          setAnchor('bottom')
        }
      } catch (error) {
        console.error('Error calculating popup anchor:', error)
        setAnchor('bottom')
      }
    }

    calculateAnchor()

    const handleMove = () => {
      calculateAnchor()
    }

    map.on('move', handleMove)
    map.on('zoom', handleMove)

    return () => {
      map.off('move', handleMove)
      map.off('zoom', handleMove)
    }
  }, [mapRef, longitude, latitude, popupWidth, popupHeight])

  return anchor
}
