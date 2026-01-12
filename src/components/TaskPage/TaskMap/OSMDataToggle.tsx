import { Database } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Switch } from '@/components/ui/Switch'

interface OSMDataToggleProps {
  showOSMData: boolean
  onToggle: () => void
  showOSMElements: {
    nodes: boolean
    ways: boolean
    areas: boolean
  }
  onToggleElement: (element: 'nodes' | 'ways' | 'areas') => void
  isLoading: boolean
}

export const OSMDataToggle = ({
  showOSMData,
  onToggle,
  showOSMElements,
  onToggleElement,
  isLoading,
}: OSMDataToggleProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading}
          className={`h-8 w-8 bg-white shadow-md hover:bg-zinc-100 md:h-10 md:w-10 dark:bg-zinc-900 dark:hover:bg-zinc-800 ${
            showOSMData ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/30' : ''
          }`}
          title="OSM Data Layer"
        >
          <Database className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>OSM Data Layer</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <div className="flex w-full items-center justify-between">
            <span>Show OSM Data</span>
            <Switch checked={showOSMData} onCheckedChange={onToggle} />
          </div>
        </DropdownMenuItem>
        {showOSMData && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-zinc-500">Elements</DropdownMenuLabel>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <div className="flex w-full items-center justify-between">
                <span>Nodes</span>
                <Switch
                  checked={showOSMElements.nodes}
                  onCheckedChange={() => onToggleElement('nodes')}
                />
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <div className="flex w-full items-center justify-between">
                <span>Ways</span>
                <Switch
                  checked={showOSMElements.ways}
                  onCheckedChange={() => onToggleElement('ways')}
                />
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <div className="flex w-full items-center justify-between">
                <span>Areas</span>
                <Switch
                  checked={showOSMElements.areas}
                  onCheckedChange={() => onToggleElement('areas')}
                />
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
