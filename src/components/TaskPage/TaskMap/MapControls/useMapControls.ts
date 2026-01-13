import { useState } from 'react'
import { useOSMDataContext } from '@/contexts/tasks/OSMDataContext'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { useTaskMapContext } from '@/contexts/tasks/TaskMapContext'
import { resetMapView } from '@/utils/mapUtils'
import { zoomToTask } from '../zoomToTask'

export const useMapControls = () => {
  const { map, mapLoaded } = useTaskMapContext()
  const { task } = useTaskContext()
  const {
    showTaskFeatures,
    setShowTaskFeatures,
    showOSMData,
    handleToggleOSMData,
    showOSMElements,
    handleToggleOSMElement,
    osmElementOrder,
    setOsmElementOrder,
    osmDataLoading,
    dataLayerOrder,
    setDataLayerOrder,
  } = useOSMDataContext()

  const [isOpen, setIsOpen] = useState(true)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)

  const handleZoomIn = () => {
    if (map.current && mapLoaded) {
      map.current.zoomIn({ duration: 300 })
    }
  }

  const handleZoomOut = () => {
    if (map.current && mapLoaded) {
      map.current.zoomOut({ duration: 300 })
    }
  }

  const handleResetView = () => {
    if (map.current && mapLoaded) {
      resetMapView(map.current)
    }
  }

  const handleLayersClick = () => {
    setIsStylePanelOpen(!isStylePanelOpen)
  }

  const handleZoomToTask = () => {
    if (!map.current || !mapLoaded || !task) {
      return
    }

    zoomToTask(map.current, task)
  }

  // Check if we should show any separators
  const showZoom = true
  const showReset = true
  const showLayers = true
  const customButtonsCount = 1
  const showFirstSeparator = showZoom && (showReset || showLayers || customButtonsCount > 0)
  const showSecondSeparator = showLayers && showReset
  const showThirdSeparator = (showReset || showLayers) && customButtonsCount > 0

  return {
    mapLoaded,
    task,
    isOpen,
    setIsOpen,
    isStylePanelOpen,
    showTaskFeatures,
    setShowTaskFeatures,
    showOSMData,
    handleToggleOSMData,
    showOSMElements,
    handleToggleOSMElement,
    osmElementOrder,
    setOsmElementOrder,
    osmDataLoading,
    dataLayerOrder,
    setDataLayerOrder,
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    handleLayersClick,
    handleZoomToTask,
    showFirstSeparator,
    showSecondSeparator,
    showThirdSeparator,
  }
}

