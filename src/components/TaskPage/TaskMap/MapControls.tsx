import { ChevronLeft, ChevronRight, Globe, Layers, MapPin, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import { useOSMDataContext } from './contexts/OSMDataContext'
import { useTaskContext } from './contexts/TaskContext'
import { useTaskMapContext } from './contexts/TaskMapContext'
import { cn } from '@/lib/utils'
import { resetMapView } from '@/utils/mapUtils'
import { StyleSwitcherPanel } from './StyleSwitcherPanel'
import { zoomToTask } from './zoomToTask'

export const MapControls = () => {
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

  return (
    <TooltipProvider>
      <div className="absolute top-0 right-0 flex h-full items-start">
        <StyleSwitcherPanel
          isOpen={isStylePanelOpen}
          showTaskFeatures={showTaskFeatures}
          onToggleTaskFeatures={() => setShowTaskFeatures((prev) => !prev)}
          showOSMData={showOSMData}
          onToggleOSMData={handleToggleOSMData}
          showOSMElements={showOSMElements}
          onToggleOSMElement={handleToggleOSMElement}
          osmElementOrder={osmElementOrder}
          onReorderOSMElements={setOsmElementOrder}
          osmDataLoading={osmDataLoading}
          dataLayerOrder={dataLayerOrder}
          onReorderDataLayers={setDataLayerOrder}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'mt-4 h-8 w-8 rounded-r-none bg-white shadow-md hover:bg-zinc-100 md:h-10 md:w-10 dark:bg-zinc-900 dark:hover:bg-zinc-800',
                !isOpen && 'mr-[-10px]'
              )}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
        </Tooltip>

        <div
          className={cn(
            'flex h-full flex-col gap-2 border-zinc-700 border-l bg-zinc-800/95 px-1 pt-4 pb-2 transition-all duration-300 ease-in-out dark:bg-zinc-900/95',
            isOpen ? 'w-10 opacity-80 md:w-12' : 'w-0 overflow-hidden opacity-0'
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={!mapLoaded}
                className="h-8 w-8 bg-white shadow-md hover:bg-zinc-100 md:h-10 md:w-10 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={!mapLoaded}
                className="h-8 w-8 bg-white shadow-md hover:bg-zinc-100 md:h-10 md:w-10 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>

          {showFirstSeparator && <div className="my-1 h-px bg-zinc-600" />}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetView}
                disabled={!mapLoaded}
                className="h-8 w-8 bg-white shadow-md hover:bg-zinc-100 md:h-10 md:w-10 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>

          {showSecondSeparator && <div className="my-1 h-px bg-zinc-600" />}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLayersClick}
                disabled={!mapLoaded}
                className="h-8 w-8 bg-white shadow-md hover:bg-zinc-100 md:h-10 md:w-10 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <Layers className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>

          {showThirdSeparator && <div className="my-1 h-px bg-zinc-600" />}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomToTask}
                disabled={!mapLoaded || !task}
                className="h-8 w-8 bg-white shadow-md hover:bg-zinc-100 md:h-10 md:w-10 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
