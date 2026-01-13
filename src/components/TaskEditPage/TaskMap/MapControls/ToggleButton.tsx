import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipTrigger } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'

interface ToggleButtonProps {
  isOpen: boolean
  onToggle: () => void
}

export const ToggleButton = ({ isOpen, onToggle }: ToggleButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'mt-4 h-8 w-8 rounded-r-none bg-white shadow-md hover:bg-zinc-100 md:h-10 md:w-10 dark:bg-zinc-900 dark:hover:bg-zinc-800',
            !isOpen && 'mr-[-10px]'
          )}
          onClick={onToggle}
        >
          {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
    </Tooltip>
  )
}
