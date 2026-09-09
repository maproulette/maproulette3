import { useIntl } from '@/i18n'
import { ClearFiltersButton } from './ClearFiltersButton'
import { DifficultyFilter } from './DifficultyFilter'
import { GlobalToggle } from './GlobalMapToggles'
import { LocationSearchFilter } from './LocationSearchFilter'
import { SortByFilter } from './SortByFilter'
import { ViewModeToggle } from './ViewModeToggle'
import { WorkOnFilter } from './WorkOnFilter'

/**
 * Filter controls for the explore page, spanning the list and the map above
 * both.
 *
 * They narrow the *list* of challenges, not the map: the map shows all
 * available work, which is what lets its tiles be a pure function of their
 * coordinates and come straight from the pre-computed pyramid. Location search
 * is the exception -- it moves the map and outlines the place.
 *
 * Writing the filter state back to the URL is the provider's job, not this
 * component's.
 */
export const FilterBar = () => {
  const { t } = useIntl()

  return (
    <div className="flex items-center gap-3 overflow-x-auto">
      <span className="shrink-0 font-medium text-sm text-zinc-600 dark:text-zinc-300">
        {t('exploreChallenges.filterBar.title', undefined, 'Challenge List Filters')}
      </span>
      <LocationSearchFilter />
      <SortByFilter />
      <WorkOnFilter />
      <DifficultyFilter />
      <GlobalToggle />
      <ClearFiltersButton />
      <div className="ml-auto">
        <ViewModeToggle />
      </div>
    </div>
  )
}
