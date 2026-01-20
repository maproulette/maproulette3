import { ChevronLeft, ChevronRight, Globe, Layers, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'
import { resetMapView } from '@/utils/mapUtils'

export interface MapControlButton {
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  tooltip?: string
  disabled?: boolean
  id?: string
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
  // biome-ignore lint/suspicious/noExplicitAny: StyleSwitcherPanel can have various prop types - using any for flexibility
  StyleSwitcherPanel?: React.ComponentType<any>
  // biome-ignore lint/suspicious/noExplicitAny: StyleSwitcherPanel props can be of various types
  styleSwitcherPanelProps?: Record<string, any>
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

  // Check if we should show any separators
  const showFirstSeparator = showZoom && (showReset || showLayers || customButtons.length > 0)
  const showSecondSeparator = showLayers && showReset
  const showThirdSeparator = (showReset || showLayers) && customButtons.length > 0

  return (
    <TooltipProvider>
      <div className={cn('absolute top-0 right-0 flex h-full items-start', className)}>
        {StyleSwitcherPanel && (
          <StyleSwitcherPanel
            isOpen={isStylePanelOpen}
            onClose={() => setIsStylePanelOpen(false)}
            {...(styleSwitcherPanelProps || {})}
          />
        )}

        {collapsible && (
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
                {isOpen ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
          </Tooltip>
        )}

        <div
          className={cn(
            'flex h-full flex-col gap-2 border-zinc-700 border-l bg-zinc-800/95 px-1 pt-4 pb-2 transition-all duration-300 ease-in-out dark:bg-zinc-900/95',
            collapsible
              ? isOpen
                ? 'w-10 opacity-80 md:w-12'
                : 'w-0 overflow-hidden opacity-0'
              : 'w-10 opacity-80 md:w-12'
          )}
        >
          {showZoom && (
            <>
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
            </>
          )}

          {showFirstSeparator && <div className="my-1 h-px bg-zinc-600" />}

          {showReset && (
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
          )}

          {showSecondSeparator && <div className="my-1 h-px bg-zinc-600" />}

          {showLayers && (
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
          )}

          {showThirdSeparator && <div className="my-1 h-px bg-zinc-600" />}

          {customButtons.map((button, index) => {
            const Icon = button.icon
            const key = button.id || button.tooltip || `custom-button-${index}`
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={button.onClick}
                    disabled={button.disabled}
                    className="h-8 w-8 bg-white shadow-md hover:bg-zinc-100 md:h-10 md:w-10 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                {button.tooltip && <TooltipContent>{button.tooltip}</TooltipContent>}
              </Tooltip>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
