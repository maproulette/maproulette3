import { Filter } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useExtendedChallengesContext } from '@/contexts/exploreChallenges/ExtendedChallengesContext'
import { useSearchContext } from '@/contexts/exploreChallenges/SearchContext'
import type { ExtendedFindParamsSortBy } from '@/types/Challenge'

const Header = () => {
  const globalId = useId()
  const { extendedFindParams, setExtendedFindParams } = useSearchContext()
  const { challenges, setMapbounds } = useExtendedChallengesContext()

  const toggleShowOnMap = () => {
    if (extendedFindParams?.bounds) {
      setExtendedFindParams({ ...extendedFindParams, bounds: '-180,-90,180,90' })
    } else {
      setMapbounds()
    }
  }

  return (
    <div className="border-zinc-200 border-b p-6 dark:border-zinc-800">
      {/* Title and Filters Button */}
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-semibold text-xl">Challenges</h1>
        <Button variant="outline" size="default" className="px-4 py-2">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Show on Map / Anywhere + Checkboxes */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant={extendedFindParams?.bounds ? 'default' : 'outline'}
            size="default"
            onClick={toggleShowOnMap}
            className="rounded-r-none p-2 text-xs"
          >
            Show on Map
          </Button>
          <Button variant="outline" size="default" className="rounded-l-none p-2 text-xs">
            Anywhere
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <input
            id={globalId}
            type="checkbox"
            checked={extendedFindParams?.global}
            onChange={(e) =>
              setExtendedFindParams({ ...extendedFindParams, global: e.target.checked })
            }
            className="h-4 w-4 rounded border-zinc-300"
          />
          <label htmlFor={globalId} className="font-medium text-xs">
            Global Challenges
          </label>
        </div>
      </div>

      {/* Results Count and Sort */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-base text-zinc-700 dark:text-zinc-300">
          {challenges?.length || 0} results
        </span>
        <Select
          value={extendedFindParams?.sortBy}
          onValueChange={(value: ExtendedFindParamsSortBy) =>
            setExtendedFindParams({
              ...extendedFindParams,
              sortBy: value,
            })
          }
        >
          <SelectTrigger className="h-10 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Default">Default</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="modified">Modified</SelectItem>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="difficulty">Difficulty</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default Header
