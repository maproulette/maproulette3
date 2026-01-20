import type { MapRef } from 'react-map-gl/maplibre'
import { Popup } from 'react-map-gl/maplibre'
import { OverlapPopup, SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
import type { PopupInfo } from './types'
import { usePopupAnchor } from './usePopupAnchor'

interface MapPopupsProps {
  popupInfo: PopupInfo
  onClose: () => void
  mapRef: React.RefObject<MapRef | null>
  onOverlapTaskSelect?: (taskId: number | null) => void
  showBundleButtons?: boolean
  activeBundle?: { bundleId: number; taskIds: number[] } | null
  primaryTaskId?: number
  onAddToBundle?: (taskId: number) => void
  onRemoveFromBundle?: (taskId: number) => void
  bundleEditsDisabled?: boolean
}

export const MapPopups = ({
  popupInfo,
  onClose,
  mapRef,
  onOverlapTaskSelect,
  showBundleButtons = false,
  activeBundle,
  primaryTaskId,
  onAddToBundle,
  onRemoveFromBundle,
  bundleEditsDisabled = false,
}: MapPopupsProps) => {
  const singleLongitude =
    popupInfo?.type === 'single' && popupInfo.task.location
      ? Number(popupInfo.task.location.lng)
      : 0
  const singleLatitude =
    popupInfo?.type === 'single' && popupInfo.task.location
      ? Number(popupInfo.task.location.lat)
      : 0

  const overlapLongitude = popupInfo?.type === 'overlap' ? popupInfo.center[0] : 0
  const overlapLatitude = popupInfo?.type === 'overlap' ? popupInfo.center[1] : 0

  const singleAnchor = usePopupAnchor({
    mapRef,
    longitude: singleLongitude,
    latitude: singleLatitude,
    popupWidth: 400,
    popupHeight: 500,
  })

  const overlapAnchor = usePopupAnchor({
    mapRef,
    longitude: overlapLongitude,
    latitude: overlapLatitude,
    popupWidth: 400,
    popupHeight: 500,
  })

  if (!popupInfo) {
    return null
  }

  const getOffset = (anchor: ReturnType<typeof usePopupAnchor>): [number, number] => {
    switch (anchor) {
      case 'bottom':
      case 'bottom-left':
      case 'bottom-right':
        return [0, -30]
      default:
        return [0, 0]
    }
  }

  if (popupInfo.type === 'single' && popupInfo.task.location) {
    return (
      <Popup
        key={`single-${popupInfo.task.id}`}
        anchor={singleAnchor}
        longitude={singleLongitude}
        latitude={singleLatitude}
        onClose={onClose}
        closeButton={false}
        closeOnClick={false}
        className="!p-0 !bg-transparent !border-0 !shadow-none"
        maxWidth="90vw"
        offset={getOffset(singleAnchor)}
      >
        <SingleTaskPopup
          task={popupInfo.task}
          onClose={onClose}
          showStartButton={false}
          showBundleButtons={showBundleButtons}
          activeBundle={activeBundle}
          primaryTaskId={primaryTaskId}
          onAddToBundle={onAddToBundle}
          onRemoveFromBundle={onRemoveFromBundle}
          bundleEditsDisabled={bundleEditsDisabled}
        />
      </Popup>
    )
  }

  if (popupInfo.type === 'overlap') {
    return (
      <Popup
        key={`overlap-${popupInfo.tasks.map((t) => t.id).join('-')}`}
        anchor={overlapAnchor}
        longitude={overlapLongitude}
        latitude={overlapLatitude}
        onClose={onClose}
        closeButton={false}
        closeOnClick={false}
        className="!p-0 !bg-transparent !border-0 !shadow-none"
        maxWidth="90vw"
        offset={getOffset(overlapAnchor)}
      >
        <OverlapPopup
          tasks={popupInfo.tasks}
          onTaskSelect={onOverlapTaskSelect}
          showStartButton={false}
          showBundleButtons={showBundleButtons}
          activeBundle={activeBundle}
          primaryTaskId={primaryTaskId}
          onAddToBundle={onAddToBundle}
          onRemoveFromBundle={onRemoveFromBundle}
          bundleEditsDisabled={bundleEditsDisabled}
        />
      </Popup>
    )
  }

  return null
}
