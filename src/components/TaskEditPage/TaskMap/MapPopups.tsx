import type { MapRef } from 'react-map-gl/maplibre'
import { SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
import type { PopupInfo } from './types'

interface MapPopupsProps {
  popupInfo: PopupInfo
  onClose: () => void
  mapRef?: React.RefObject<MapRef | null>
  showBundleButtons?: boolean
  activeBundle?: { bundleId: number; taskIds: number[] } | null
  primaryTaskId?: number
  onAddToBundle?: (taskId: number) => void
  onRemoveFromBundle?: (taskId: number) => void
  bundleEditsDisabled?: boolean
  markersHidden?: boolean
  onToggleMarkersHidden?: () => void
}

export const MapPopups = ({
  popupInfo,
  onClose,
  mapRef,
  showBundleButtons = false,
  activeBundle,
  primaryTaskId,
  onAddToBundle,
  onRemoveFromBundle,
  bundleEditsDisabled = false,
  markersHidden = false,
  onToggleMarkersHidden,
}: MapPopupsProps) => {
  if (!popupInfo) {
    return null
  }

  if (popupInfo.type === 'single' && popupInfo.task.location) {
    return (
      <div className="absolute top-14 left-2 z-10 h-[400px] w-[300px]">
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
          mapRef={mapRef}
          markersHidden={markersHidden}
          onToggleMarkersHidden={onToggleMarkersHidden}
        />
      </div>
    )
  }

  return null
}
