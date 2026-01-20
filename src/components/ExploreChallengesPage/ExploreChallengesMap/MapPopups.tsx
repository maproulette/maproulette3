import type { MapRef } from 'react-map-gl/maplibre'
import { Popup } from 'react-map-gl/maplibre'
import { OverlapPopup, SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
import type { PopupInfo } from './types'
import { usePopupAnchor } from './usePopupAnchor'

interface MapPopupsProps {
  popupInfo: PopupInfo
  onClose: () => void
  mapRef: React.RefObject<MapRef | null>
}

export const MapPopups = ({ popupInfo, onClose, mapRef }: MapPopupsProps) => {
  // Call hook unconditionally at the top level
  const longitude =
    popupInfo?.type === 'single' && popupInfo.task.location
      ? Number(popupInfo.task.location.lng)
      : 0
  const latitude =
    popupInfo?.type === 'single' && popupInfo.task.location
      ? Number(popupInfo.task.location.lat)
      : 0

  const anchor = usePopupAnchor({
    mapRef,
    longitude,
    latitude,
    popupWidth: 400,
    popupHeight: 500,
  })

  if (!popupInfo) {
    return null
  }

  if (popupInfo.type === 'single' && popupInfo.task.location) {
    // Calculate offset based on anchor
    const getOffset = (): [number, number] => {
      switch (anchor) {
        case 'bottom':
        case 'bottom-left':
        case 'bottom-right':
          return [0, -30]
        default:
          return [0, 0]
      }
    }

    return (
      <Popup
        key={`single-${popupInfo.task.id}`}
        anchor={anchor}
        longitude={longitude}
        latitude={latitude}
        onClose={onClose}
        closeButton={false}
        closeOnClick={false}
        className="!p-0 !bg-transparent !border-0 !shadow-none"
        maxWidth="90vw"
        offset={getOffset()}
      >
        <SingleTaskPopup task={popupInfo.task} onClose={onClose} />
      </Popup>
    )
  }

  if (popupInfo.type === 'overlap') {
    return (
      <Popup
        key={`overlap-${popupInfo.tasks.map((t) => t.id).join('-')}`}
        anchor="top"
        longitude={popupInfo.center[0]}
        latitude={popupInfo.center[1]}
        onClose={onClose}
        closeButton={true}
        closeOnClick={true}
      >
        <OverlapPopup tasks={popupInfo.tasks} />
      </Popup>
    )
  }

  return null
}
