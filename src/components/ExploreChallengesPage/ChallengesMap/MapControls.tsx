import { useState } from 'react'
import { Globe, Layers, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'

export const MapControls = () => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <TooltipProvider>
      <div className="absolute top-0 right-0 h-full flex items-start">
        {/* Toggle Button */}
        <div className="pt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-white shadow-md rounded-r-none md:h-10 md:w-10 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isOpen ? 'Close Controls' : 'Open Controls'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Drawer Panel */}
        <div
          className={`flex flex-col gap-2 bg-zinc-800/95 dark:bg-zinc-900/95 pl-2 pr-1 pb-2 pt-4 transition-all duration-300 ease-in-out border-l border-zinc-700 h-full ${
            isOpen ? 'w-14 md:w-16 opacity-100' : 'w-0 opacity-0 overflow-hidden'
          }`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Layers className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Toggle Layers</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="h-px bg-zinc-600 my-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Reset View</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Search Location</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
