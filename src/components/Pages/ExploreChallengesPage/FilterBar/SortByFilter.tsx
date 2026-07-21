import { useExploreChallengesSearchContext } from '@/components/Pages/ExploreChallengesPage/contexts/ExploreChallengesSearchContext'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useIntl } from '@/i18n'
import type { ExtendedFindParamsSortBy } from '@/types/Challenge'

export const SortByFilter = () => {
  const { t } = useIntl()
  const { sortBy, setSortBy } = useExploreChallengesSearchContext()
  return (
    <div className="flex items-center gap-2">
      <Label className="whitespace-nowrap font-medium text-sm text-zinc-700 dark:text-zinc-300">
        {t('exploreChallenges.filterBar.sortBy.label', undefined, 'Sort by')}
      </Label>
      <Select
        value={sortBy || 'name'}
        onValueChange={(value) => setSortBy(value as ExtendedFindParamsSortBy)}
      >
        <SelectTrigger className="h-9 w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">
            {t('exploreChallenges.filterBar.sortBy.name', undefined, 'Name')}
          </SelectItem>
          <SelectItem value="created">
            {t('exploreChallenges.filterBar.sortBy.newest', undefined, 'Newest')}
          </SelectItem>
          <SelectItem value="modified">
            {t('exploreChallenges.filterBar.sortBy.oldest', undefined, 'Oldest')}
          </SelectItem>
          <SelectItem value="popularity">
            {t('exploreChallenges.filterBar.sortBy.popular', undefined, 'Popular')}
          </SelectItem>
          <SelectItem value="difficulty">
            {t('exploreChallenges.filterBar.sortBy.difficulty', undefined, 'Difficulty')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
