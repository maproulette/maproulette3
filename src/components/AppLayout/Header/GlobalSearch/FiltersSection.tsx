import { useState } from 'react'
import type { BBox } from '@/utils/locationService'
import { LocationFilter } from './GlobalSearchDropdown/FindChallenge/FindChallengeFilterSection/LocationFilter'

interface FiltersSectionProps {
  onFiltersChange?: (filters: Record<string, boolean | string | BBox | undefined>) => void
}

export const FiltersSection = ({ onFiltersChange }: FiltersSectionProps) => {
  const [globalChallenges] = useState(false)
  const [sortBy] = useState('name')
  const [boundingBox, setBoundingBox] = useState<BBox | undefined>()

  const updateFilters = (
    updates: Partial<{ global: boolean; sortBy: string; boundingBox: BBox | undefined }>
  ) => {
    onFiltersChange?.({
      global: updates.global ?? globalChallenges,
      sortBy: updates.sortBy ?? sortBy,
      boundingBox: updates.boundingBox ?? boundingBox,
    })
  }

  const handleLocationChange = (bbox: BBox | undefined) => {
    setBoundingBox(bbox)
    updateFilters({ boundingBox: bbox })
  }

  return (
    <div className="space-y-3 border-zinc-200 border-b pb-4 dark:border-zinc-800">
      <div className="space-y-3">
        <LocationFilter onLocationChange={handleLocationChange} />
      </div>
    </div>
  )
}
