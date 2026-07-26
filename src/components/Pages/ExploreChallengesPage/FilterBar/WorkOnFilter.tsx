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
import type { WorkOnCategory } from './filterTypes'

export const WorkOnFilter = () => {
  const { t } = useIntl()
  const { workOn, setWorkOn } = useExploreChallengesSearchContext()
  return (
    <div className="flex items-center gap-2">
      <Label className="whitespace-nowrap font-medium text-sm text-zinc-700 dark:text-zinc-300">
        {t('exploreChallenges.filterBar.workOn.label', undefined, 'Work on')}
      </Label>
      <Select value={workOn} onValueChange={(value) => setWorkOn(value as WorkOnCategory)}>
        <SelectTrigger className="h-9 w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Anything">
            {t('exploreChallenges.filterBar.workOn.anything', undefined, 'Anything')}
          </SelectItem>
          <SelectItem value="Roads / Pedestrian / Cycleways">
            {t(
              'exploreChallenges.filterBar.workOn.roadsPedestrianCycleways',
              undefined,
              'Roads / Pedestrian / Cycleways'
            )}
          </SelectItem>
          <SelectItem value="Water">
            {t('exploreChallenges.filterBar.workOn.water', undefined, 'Water')}
          </SelectItem>
          <SelectItem value="Points / Areas of Interest">
            {t(
              'exploreChallenges.filterBar.workOn.pointsAreasOfInterest',
              undefined,
              'Points / Areas of Interest'
            )}
          </SelectItem>
          <SelectItem value="Buildings">
            {t('exploreChallenges.filterBar.workOn.buildings', undefined, 'Buildings')}
          </SelectItem>
          <SelectItem value="Land Use / Administrative Boundaries">
            {t(
              'exploreChallenges.filterBar.workOn.landUseAdministrativeBoundaries',
              undefined,
              'Land Use / Administrative Boundaries'
            )}
          </SelectItem>
          <SelectItem value="Transit">
            {t('exploreChallenges.filterBar.workOn.transit', undefined, 'Transit')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
