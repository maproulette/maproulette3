import { Button } from '@/components/ui/Button'
import { Globe, Layers } from 'lucide-react'

const MapControls = () => {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
        <Layers className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </Button>
      <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </Button>
      <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
        <Globe className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </Button>
    </div>
  )
}

export default MapControls
