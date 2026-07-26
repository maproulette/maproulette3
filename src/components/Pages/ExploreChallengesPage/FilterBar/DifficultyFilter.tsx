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
import type { DifficultyLevel } from './filterTypes'

export const DifficultyFilter = () => {
  const { t } = useIntl()
  const { difficulty, setDifficulty } = useExploreChallengesSearchContext()
  return (
    <div className="flex items-center gap-2">
      <Label className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
        {t('common.difficulty', undefined, 'Difficulty')}
      </Label>
      <Select value={difficulty} onValueChange={(value) => setDifficulty(value as DifficultyLevel)}>
        <SelectTrigger className="h-9 w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Any">
            {t('exploreChallenges.filterBar.difficulty.any', undefined, 'Any')}
          </SelectItem>
          <SelectItem value="Easy">{t('common.easy', undefined, 'Easy')}</SelectItem>
          <SelectItem value="Normal">{t('common.normal', undefined, 'Normal')}</SelectItem>
          <SelectItem value="Expert">{t('common.expert', undefined, 'Expert')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
