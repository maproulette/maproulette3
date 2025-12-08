import { useExploreChallengesSearchContext } from '@/components/ExploreChallengesPage/ExploreChallengesSearchContext'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import type { ExtendedFindParamsSortBy } from '@/types/Challenge'

export const SortByFilter = () => {
  const { sortBy, setSortBy } = useExploreChallengesSearchContext()
  return (
    <div className="flex items-center gap-2">
      <Label className="font-medium text-sm text-zinc-700 dark:text-zinc-300">Sort:</Label>
      <Select
        value={sortBy || 'name'}
        onValueChange={(value) => setSortBy(value as ExtendedFindParamsSortBy)}
      >
        <SelectTrigger className="h-9 w-28 border-zinc-300 dark:border-zinc-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="created">Newest</SelectItem>
          <SelectItem value="modified">Oldest</SelectItem>
          <SelectItem value="popularity">Popular</SelectItem>
          <SelectItem value="difficulty">Difficulty</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
