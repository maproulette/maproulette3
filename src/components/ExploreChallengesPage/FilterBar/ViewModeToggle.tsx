import { LayoutGrid, List, Map as MapIcon } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'

const itemClass =
  'h-8 w-8 text-slate-400 hover:bg-transparent hover:text-white data-[state=on]:bg-slate-700 data-[state=on]:text-white dark:hover:bg-transparent dark:data-[state=on]:bg-slate-700 dark:data-[state=on]:text-white'

export const ViewModeToggle = () => {
  const { viewMode, setViewMode } = useExploreChallengesSearchContext()
  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={(value) => {
        if (value) setViewMode(value as typeof viewMode)
      }}
      className="overflow-hidden rounded-full border border-slate-800 bg-slate-900"
    >
      <ToggleGroupItem value="grid-map" title="Grid with map view" size="sm" className={itemClass}>
        <MapIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" title="Grid view" size="sm" className={itemClass}>
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" title="List view" size="sm" className={itemClass}>
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
