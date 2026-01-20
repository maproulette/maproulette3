import { Popup } from 'react-map-gl/maplibre'
import { OverlapPopup, SingleTaskPopup } from '@/components/OverlapedMarkersPopup'
import type { TaskMarker } from '@/types/Task'
import type { PopupInfo } from './hooks'

interface MapPopupsProps {
  popupInfo: PopupInfo
  onClose: () => void
}

export const MapPopups = ({ popupInfo, onClose }: MapPopupsProps) => {
  if (!popupInfo) {
    return null
  }

  if (popupInfo.type === 'single' && popupInfo.task.location) {
    return (
      <Popup
        key={`single-${popupInfo.task.id}`}
        anchor="top"
        longitude={Number(popupInfo.task.location.lng)}
        latitude={Number(popupInfo.task.location.lat)}
        onClose={onClose}
        closeButton={true}
        closeOnClick={true}
      >
        <SingleTaskPopup task={popupInfo.task} />
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

