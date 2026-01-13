import { Globe, Layers, MapPin, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipTrigger } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/Task'

interface ControlButtonsPanelProps {
  isOpen: boolean
  mapLoaded: boolean
  task: Task | null
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  onLayersClick: () => void
  onZoomToTask: () => void
  showFirstSeparator: boolean
  showSecondSeparator: boolean
  showThirdSeparator: boolean
}

export const ControlButtonsPanel = ({
  isOpen,
  mapLoaded,
  task,
  onZoomIn,
  onZoomOut,
  onResetView,
  onLayersClick,
  onZoomToTask,
  showFirstSeparator,
  showSecondSeparator,
  showThirdSeparator,
}: ControlButtonsPanelProps) => {
  return (
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
            onClick={onZoomIn}
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
            onClick={onZoomOut}
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
            onClick={onResetView}
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
            onClick={onLayersClick}
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
            onClick={onZoomToTask}
            disabled={!mapLoaded || !task}
            className="h-8 w-8 bg-white shadow-md hover:bg-zinc-100 md:h-10 md:w-10 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
      </Tooltip>
    </div>
  )
}
