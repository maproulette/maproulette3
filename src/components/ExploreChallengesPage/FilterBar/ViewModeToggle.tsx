import { LayoutGrid, List, Map as MapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'

export const ViewModeToggle = () => {
  const { viewMode, setViewMode } = useExploreChallengesSearchContext()
  return (
    <div className="flex items-center overflow-hidden rounded-full border border-[rgba(30,41,59,1)] bg-[rgba(15,23,42,1)]">
      <button
        type="button"
        onClick={() => setViewMode('grid-map')}
        title="Grid with map view"
        className={cn(
          'flex h-8 w-8 cursor-pointer items-center justify-center transition-colors',
          viewMode === 'grid-map'
            ? 'bg-slate-700 text-white'
            : 'text-slate-400 hover:text-white'
        )}
      >
        <MapIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setViewMode('grid')}
        title="Grid view"
        className={cn(
          'flex h-8 w-8 cursor-pointer items-center justify-center transition-colors',
          viewMode === 'grid'
            ? 'bg-slate-700 text-white'
            : 'text-slate-400 hover:text-white'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setViewMode('list')}
        title="List view"
        className={cn(
          'flex h-8 w-8 cursor-pointer items-center justify-center transition-colors',
          viewMode === 'list'
            ? 'bg-slate-700 text-white'
            : 'text-slate-400 hover:text-white'
        )}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  )
}
