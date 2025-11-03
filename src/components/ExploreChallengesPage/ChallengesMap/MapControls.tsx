import { Globe, Info, Layers, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'

export const MapControls = () => {
  return (
    <TooltipProvider>
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 md:top-4 md:right-4 md:gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900"
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
              className="h-9 w-9 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900"
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
              className="h-9 w-9 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900"
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
              className="h-9 w-9 bg-white shadow-md md:h-10 md:w-10 dark:bg-zinc-900"
            >
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Map Info</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
