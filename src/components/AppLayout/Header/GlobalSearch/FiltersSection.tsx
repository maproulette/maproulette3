import { Hash, MapPin, Search } from 'lucide-react'
import { useState } from 'react'
import { Label } from '@/components/ui/Label'
import type { BBox } from '@/utils/locationService'
import { LocationFilter } from './GlobalSearchDropdown/FindChallenge/FindChallengeFilterSection/LocationFilter'

interface FiltersSectionProps {
  onFiltersChange?: (filters: Record<string, boolean | string | BBox | undefined>) => void
  nameFilter?: string
  onNameFilterChange?: (name: string) => void
  idFilter?: string
  onIdFilterChange?: (id: string) => void
}

export const FiltersSection = ({
  onFiltersChange,
  nameFilter = '',
  onNameFilterChange,
  idFilter = '',
  onIdFilterChange,
}: FiltersSectionProps) => {
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
    <div className="space-y-4 border-zinc-200 border-b pb-4 dark:border-zinc-800">
      {/* Name and ID filters */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            <Search className="h-3.5 w-3.5" />
            Name
          </Label>
          <input
            type="text"
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => onNameFilterChange?.(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            <Hash className="h-3.5 w-3.5" />
            ID
          </Label>
          <input
            type="text"
            placeholder="Search by ID..."
            value={idFilter}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '') // Only allow numbers
              onIdFilterChange?.(value)
            }}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
      </div>

      {/* Location filter */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
          <MapPin className="h-3.5 w-3.5" />
          Location
        </Label>
        <LocationFilter onLocationChange={handleLocationChange} />
      </div>
    </div>
  )
}
