import { ChevronDown, ChevronUp, Globe, Layers, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'
import { resetMapView } from '@/utils/mapUtils'

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

  const controlButtonClass =
    'flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-300 transition-colors hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <TooltipProvider>
      <div className={cn('absolute top-0 right-0 flex flex-col items-end', className)}>
        {StyleSwitcherPanel && styleSwitcherPanelProps && (
          <StyleSwitcherPanel {...styleSwitcherPanelProps} />
        )}

        <div className="mt-2 mr-2 flex flex-col items-center rounded-2xl bg-[rgba(15,23,42,0.95)] p-1.5">
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
                  <button
                    type="button"
                    onClick={handleLayersClick}
                    disabled={!mapLoaded}
                    className={controlButtonClass}
                  >
                    <Layers className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
              </Tooltip>
            )}

            {showReset && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleResetView}
                    disabled={!mapLoaded}
                    className={controlButtonClass}
                  >
                    <Globe className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
              </Tooltip>
            )}

            {showZoom && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      disabled={!mapLoaded}
                      className={controlButtonClass}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      disabled={!mapLoaded}
                      className={controlButtonClass}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
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
                    <button
                      type="button"
                      onClick={button.onClick}
                      disabled={button.disabled}
                      className={cn(
                        controlButtonClass,
                        button.isActive && 'text-blue-400 hover:text-blue-300'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  {button.tooltip && <TooltipContent>{button.tooltip}</TooltipContent>}
                </Tooltip>
              )
            })}
          </div>

          {/* Divider + collapse toggle */}
          {collapsible && (
            <>
              <div className="my-1 h-px w-6 bg-slate-600" />
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={controlButtonClass}
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
