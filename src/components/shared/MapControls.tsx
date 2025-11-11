import { ChevronLeft, ChevronRight, Globe, Info, Layers, ZoomIn, ZoomOut } from 'lucide-react'
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
  variant?: 'full' | 'simple' | 'task'
  customButtons?: MapControlButton[]
  showZoom?: boolean
  showReset?: boolean
  showLayers?: boolean
  showInfo?: boolean
  collapsible?: boolean
  className?: string
  onLayersClick?: () => void
  StyleSwitcherPanel?: React.ComponentType<{ isOpen: boolean }>
}

export const MapControls = ({
  variant = 'full',
  customButtons = [],
  showZoom = true,
  showReset = true,
  showLayers = true,
  showInfo = false,
  collapsible = false,
  className,
  onLayersClick,
  StyleSwitcherPanel,
}: MapControlsProps) => {
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

  const handleLayersClick = () => {
    if (onLayersClick) {
      onLayersClick()
    } else {
      setIsStylePanelOpen(!isStylePanelOpen)
    }
  }

  // Simple variant (non-collapsible, minimal controls)
  if (variant === 'simple') {
    return (
      <div className={cn('absolute top-4 right-4 flex flex-col gap-2', className)}>
        {showLayers && (
          <Button
            variant="outline"
            size="icon"
            className="bg-white dark:bg-zinc-900"
            onClick={handleLayersClick}
            disabled={!mapLoaded}
          >
            <Layers className="h-4 w-4" />
          </Button>
        )}
        {showZoom && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="bg-white dark:bg-zinc-900"
              onClick={handleZoomIn}
              disabled={!mapLoaded}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white dark:bg-zinc-900"
              onClick={handleZoomOut}
              disabled={!mapLoaded}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </>
        )}
        {showReset && (
          <Button
            variant="outline"
            size="icon"
            className="bg-white dark:bg-zinc-900"
            onClick={handleResetView}
            disabled={!mapLoaded}
          >
            <Globe className="h-4 w-4" />
          </Button>
        )}
        {showInfo && (
          <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
            <Info className="h-4 w-4" />
          </Button>
        )}
        {customButtons.map((button, index) => {
          const Icon = button.icon
          const key = button.id || button.tooltip || `custom-button-simple-${index}`
          return (
            <Button
              key={key}
              variant="outline"
              size="icon"
              className="bg-white dark:bg-zinc-900"
              onClick={button.onClick}
              disabled={button.disabled}
              title={button.tooltip}
            >
              <Icon className="h-4 w-4" />
            </Button>
          )
        })}
      </div>
    )
  }

  // Task variant (single button)
  if (variant === 'task') {
    return (
      <div className={cn('absolute top-4 right-4 flex flex-col gap-2', className)}>
        {customButtons.map((button, index) => {
          const Icon = button.icon
          const key = button.id || button.tooltip || `custom-button-task-${index}`
          return (
            <Button
              key={key}
              variant="outline"
              size="icon"
              className="bg-white dark:bg-zinc-900"
              onClick={button.onClick}
              disabled={button.disabled}
              title={button.tooltip}
            >
              <Icon className="h-4 w-4" />
            </Button>
          )
        })}
      </div>
    )
  }

  // Full variant (collapsible with all features)
  return (
    <TooltipProvider>
      <div className={cn('absolute top-0 right-0 flex h-full items-start', className)}>
        {StyleSwitcherPanel && <StyleSwitcherPanel isOpen={isStylePanelOpen} />}

        {collapsible && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`mt-4 ${!isOpen ? 'mr-[-10px]' : 'mr-0'} h-8 w-8 rounded-r-none bg-white shadow-md hover:bg-zinc-100 md:h-10 md:w-10 dark:bg-zinc-900 dark:hover:bg-zinc-800`}
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

          {(showZoom || showReset || showLayers) && <div className="my-1 h-px bg-zinc-600" />}

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

          {showLayers && (
            <>
              {showReset && <div className="my-1 h-px bg-zinc-600" />}
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
            </>
          )}

          {customButtons.length > 0 && <div className="my-1 h-px bg-zinc-600" />}

          {customButtons.map((button, index) => {
            const Icon = button.icon
            const key = button.id || button.tooltip || `custom-button-full-${index}`
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
