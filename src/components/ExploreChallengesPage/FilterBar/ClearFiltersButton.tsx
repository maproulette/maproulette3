import { X } from 'lucide-react'

interface ClearFiltersButtonProps {
  onClear: () => void
  hasActiveFilters: boolean
}

export const ClearFiltersButton = ({ onClear, hasActiveFilters }: ClearFiltersButtonProps) => {
  if (!hasActiveFilters) {
    return null
  }

  return (
    <button
      type="button"
      onClick={onClear}
      className="flex h-6 cursor-pointer items-center gap-1 rounded-full bg-cyan-600 px-2.5 text-[11px] font-semibold text-black transition-colors hover:bg-cyan-500"
    >
      <X className="h-3 w-3" />
      CLEAR FILTERS
    </button>
  )
}
