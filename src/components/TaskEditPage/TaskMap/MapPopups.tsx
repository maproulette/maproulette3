import type { MapRef } from 'react-map-gl/maplibre'
import { OverlapPopup, SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
import type { PopupInfo } from './types'

interface MapPopupsProps {
  popupInfo: PopupInfo
  onClose: () => void
  mapRef?: React.RefObject<MapRef | null>
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

  if (!popupInfo) {
    return null
  }

  return (
    <div className="absolute left-4 top-4 z-10 w-[250px] h-[350px]">
      {popupInfo.type === 'single' && popupInfo.task.location ? (
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
        />
      ) : popupInfo.type === 'overlap' ? (
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
      ) : null}
    </div>
  )
}
