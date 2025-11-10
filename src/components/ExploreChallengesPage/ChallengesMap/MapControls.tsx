import { useState } from 'react'
import { Globe, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import { useMapContext } from '@/contexts/MapContext'
import { resetMapView } from '@/utils/mapUtils'
import { StyleSwitcherPanel } from './StyleSwitcherPanel'

export const MapControls = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)
  const { map, mapLoaded } = useMapContext()

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

  return (
    <TooltipProvider>
      <div className="absolute top-0 right-0 h-full flex items-start">
        <StyleSwitcherPanel 
          isOpen={isStylePanelOpen} 
        />
        
       
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`mt-4 ${!isOpen ? 'mr-[-10px]' : 'mr-0'} h-8 w-8 bg-white shadow-md rounded-r-none md:h-10 md:w-10 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
        </Tooltip>

       
        <div
          className={`flex flex-col gap-2 bg-zinc-800/95 dark:bg-zinc-900/95 px-1 pb-2 pt-4 transition-all duration-300 ease-in-out border-l border-zinc-700 h-full ${
            isOpen ? 'w-10 md:w-12 opacity-80' : 'w-0 opacity-0 overflow-hidden'
          }`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={!mapLoaded}
                className="h-8 w-8 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                className="h-8 w-8 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>

         
          <div className="h-px bg-zinc-600 my-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetView}
                disabled={!mapLoaded}
                className="h-8 w-8 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>

         
          <div className="h-px bg-zinc-600 my-1" />

         
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
                disabled={!mapLoaded}
                className="h-8 w-8 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Layers className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
