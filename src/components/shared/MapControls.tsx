import { ChevronLeft, ChevronRight, Globe, Layers, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import { useMapContext } from '@/contexts/MapContext'
import { cn } from '@/lib/utils'
import { resetMapView } from '@/utils/mapUtils'

export interface MapControlButton {
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  tooltip?: string
  disabled?: boolean
  id?: string
}

interface MapControlsProps {
  customButtons?: MapControlButton[]
  showZoom?: boolean
  showReset?: boolean
  showLayers?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
  onLayersClick?: () => void
  StyleSwitcherPanel?: React.ComponentType<{ isOpen: boolean }>
}

export const MapControls = ({
  customButtons = [],
  showZoom = true,
  showReset = true,
  showLayers = true,
  collapsible = false,
  defaultOpen = true,
  className,
  onLayersClick,
  StyleSwitcherPanel,
}: MapControlsProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
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
        {/* Style Switcher Panel (if provided) */}
        {StyleSwitcherPanel && <StyleSwitcherPanel isOpen={isStylePanelOpen} />}

        {/* Toggle Button (if collapsible) */}
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

        {/* Controls Container - Dark Sidebar */}
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
          {/* Zoom Controls */}
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

          {/* Separator after zoom */}
          {showFirstSeparator && <div className="my-1 h-px bg-zinc-600" />}

          {/* Reset View */}
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

          {/* Separator before layers */}
          {showSecondSeparator && <div className="my-1 h-px bg-zinc-600" />}

          {/* Layers */}
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

          {/* Separator before custom buttons */}
          {showThirdSeparator && <div className="my-1 h-px bg-zinc-600" />}

          {/* Custom Buttons */}
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
              </Tooltip>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
