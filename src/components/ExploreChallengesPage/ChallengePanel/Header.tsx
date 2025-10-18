import { Filter } from 'lucide-react'
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
  const { searchParams, setSearchParams } = useSearchContext()
  const { challenges, challengesLoading } = useExtendedChallengesContext()

  return (
    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
      {/* Title and Filters Button */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold">Challenges</h1>
        <Button variant="outline" size="default" className="px-4 py-2">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Show on Map / Anywhere + Checkboxes */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Button
            variant={searchParams.onMap ? 'default' : 'outline'}
            size="default"
            onClick={() => setSearchParams({ ...searchParams, onMap: !searchParams.onMap })}
            className="p-2 text-xs rounded-r-none"
          >
            Show on Map
          </Button>
          <Button variant="outline" size="default" className="p-2 text-xs rounded-l-none">
            Anywhere
          </Button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="archived"
              checked={searchParams.archived}
              onChange={(e) => setSearchParams({ ...searchParams, archived: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-300"
            />
            <label htmlFor="archived" className="text-xs font-medium">
              Archived
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="global"
              checked={searchParams.global}
              onChange={(e) => setSearchParams({ ...searchParams, global: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-300"
            />
            <label htmlFor="global" className="text-xs font-medium">
              Global Challenges
            </label>
          </div>
        </div>
      </div>

      {/* Results Count and Sort */}
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-zinc-700 dark:text-zinc-300">
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
          <SelectTrigger className="w-40 h-10">
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
