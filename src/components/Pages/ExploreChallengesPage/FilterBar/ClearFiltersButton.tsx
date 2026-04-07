import { X } from 'lucide-react'
import { useExploreChallengesSearchContext } from '@/components/Pages/ExploreChallengesPage/contexts/ExploreChallengesSearchContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export const ClearFiltersButton = () => {
  const {
    difficulty,
    workOn,
    selectedCategories,
    global,
    locationId,
    keywords,
    handleClearFilters,
  } = useExploreChallengesSearchContext()

  const hasActiveFilters =
    difficulty !== 'Any' ||
    workOn !== 'Anything' ||
    selectedCategories.length > 0 ||
    global !== undefined ||
    locationId !== undefined ||
    keywords !== undefined

  return (
    <Button
      size="sm"
      onClick={handleClearFilters}
      className={cn(
        'h-6 gap-1 rounded-full bg-cyan-600 px-2.5 font-semibold text-[11px] text-black hover:bg-cyan-500',
        !hasActiveFilters && 'cursor-not-allowed opacity-50'
      )}
      disabled={!hasActiveFilters}
    >
      <X className="h-3 w-3" />
      CLEAR FILTERS
    </Button>
  )
}
