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
import { useExtendedChallengesContext } from '@/contexts/challenges/ExtendedChallengesContext'
import { useSearchContext } from '@/contexts/challenges/SearchContext'

const Header = () => {
  const archivedId = useId()
  const globalId = useId()
  const { searchParams, setSearchParams } = useSearchContext()
  const { challenges, challengesLoading } = useExtendedChallengesContext()

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
            variant={searchParams.onMap ? 'default' : 'outline'}
            size="default"
            onClick={() => setSearchParams({ ...searchParams, onMap: !searchParams.onMap })}
            className="rounded-r-none p-2 text-xs"
          >
            Show on Map
          </Button>
          <Button variant="outline" size="default" className="rounded-l-none p-2 text-xs">
            Anywhere
          </Button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={archivedId}
              checked={searchParams.archived}
              onChange={(e) => setSearchParams({ ...searchParams, archived: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <label htmlFor={archivedId} className="font-medium text-xs">
              Archived
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={globalId}
              checked={searchParams.global}
              onChange={(e) => setSearchParams({ ...searchParams, global: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <label htmlFor={globalId} className="font-medium text-xs">
              Global Challenges
            </label>
          </div>
        </div>
      </div>

      {/* Results Count and Sort */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-base text-zinc-700 dark:text-zinc-300">
          {challengesLoading ? 'Loading...' : challenges?.length || 0} results
        </span>
        <Select
          value={searchParams.sortBy}
          onValueChange={(value) =>
            setSearchParams({
              ...searchParams,
              sortBy: value as 'popularity' | 'created' | 'modified' | 'name',
            })
          }
        >
          <SelectTrigger className="h-10 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Default">Default</SelectItem>
            <SelectItem value="Name">Name</SelectItem>
            <SelectItem value="Created">Created</SelectItem>
            <SelectItem value="Popularity">Popularity</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default Header
