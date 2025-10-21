import { Globe, Info, Layers, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const MapControls = () => {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
        <Layers className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
        <Globe className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
        <Info className="h-4 w-4" />
      </Button>
    </div>
  )
}
