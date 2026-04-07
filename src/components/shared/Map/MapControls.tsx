import { ChevronDown, ChevronUp, Globe, Layers, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { resetMapView } from '@/components/shared/Map/mapUtils'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import { cn } from '@/components/utils'

export interface MapControlButton {
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  tooltip?: string
  disabled?: boolean
  id?: string
  isActive?: boolean
}

export interface MapControlsProps {
  map: React.RefObject<MapRef | null>
  mapLoaded: boolean
  customButtons?: MapControlButton[]
  showZoom?: boolean
  showReset?: boolean
  showLayers?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
  onLayersClick?: () => void
  StyleSwitcherPanel?: React.ComponentType<{
    map: React.RefObject<MapRef | null>
    mapLoaded: boolean
    isOpen: boolean
    onClose: () => void
  }>
  styleSwitcherPanelProps?: {
    map: React.RefObject<MapRef | null>
    mapLoaded: boolean
    isOpen: boolean
    onClose: () => void
  }
}

const mapButtonClass =
  'text-zinc-500 hover:bg-transparent hover:text-zinc-900 dark:text-slate-300 dark:hover:text-white'

export const MapControls = ({
  map,
  mapLoaded,
  customButtons = [],
  showZoom = true,
  showReset = true,
  showLayers = true,
  collapsible = false,
  defaultOpen = true,
  className,
  onLayersClick,
  StyleSwitcherPanel,
  styleSwitcherPanelProps,
}: MapControlsProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)

  const handleZoomIn = () => {
    if (map.current && mapLoaded) {
      const maplibreMap = map.current.getMap()
      maplibreMap.zoomIn({ duration: 300 })
    }
  }

  const handleZoomOut = () => {
    if (map.current && mapLoaded) {
      const maplibreMap = map.current.getMap()
      maplibreMap.zoomOut({ duration: 300 })
    }
  }

  const handleResetView = () => {
    if (map.current && mapLoaded) {
      const maplibreMap = map.current.getMap()
      resetMapView(maplibreMap)
    }
  }

  const handleLayersClick = () => {
    if (onLayersClick) {
      onLayersClick()
    } else {
      setIsStylePanelOpen(!isStylePanelOpen)
    }
  }

  return (
    <TooltipProvider>
      <div className={cn('absolute top-0 right-0 flex flex-col items-end', className)}>
        {StyleSwitcherPanel && styleSwitcherPanelProps && (
          <StyleSwitcherPanel {...styleSwitcherPanelProps} />
        )}

        <div className="mt-2 mr-2 flex flex-col items-center rounded-2xl bg-white/95 p-1.5 shadow-lg dark:bg-slate-900/95 dark:shadow-none">
          {/* Collapsible icons section */}
          <div
            className={cn(
              'flex flex-col items-center gap-1 overflow-hidden transition-all duration-300 ease-in-out',
              collapsible && !isOpen ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
            )}
          >
            {showLayers && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLayersClick}
                    disabled={!mapLoaded}
                    className={mapButtonClass}
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            )}

            {showReset && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleResetView}
                    disabled={!mapLoaded}
                    className={mapButtonClass}
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            )}

            {showZoom && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleZoomIn}
                      disabled={!mapLoaded}
                      className={mapButtonClass}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleZoomOut}
                      disabled={!mapLoaded}
                      className={mapButtonClass}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                </Tooltip>
              </>
            )}

            {customButtons.map((button, index) => {
              const Icon = button.icon
              const key = button.id || button.tooltip || `custom-button-${index}`
              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={button.onClick}
                      disabled={button.disabled}
                      className={cn(
                        mapButtonClass,
                        button.isActive && 'text-blue-400 hover:text-blue-300'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  {button.tooltip && <TooltipContent>{button.tooltip}</TooltipContent>}
                </Tooltip>
              )
            })}
          </div>

          {/* Divider + collapse toggle */}
          {collapsible && (
            <>
              <Separator className="my-1 w-6 bg-zinc-200 dark:bg-slate-600" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={mapButtonClass}
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
