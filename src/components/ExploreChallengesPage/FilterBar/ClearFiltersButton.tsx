import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ClearFiltersButtonProps {
  onClear: () => void
  hasActiveFilters: boolean
}

export const ClearFiltersButton = ({ onClear, hasActiveFilters }: ClearFiltersButtonProps) => {
  if (!hasActiveFilters) {
    return null
  }

  return (
    <Button
      size="sm"
      onClick={onClear}
      className="h-6 gap-1 rounded-full bg-cyan-600 px-2.5 font-semibold text-[11px] text-black hover:bg-cyan-500"
    >
      <X className="h-3 w-3" />
      CLEAR FILTERS
    </Button>
  )
}
