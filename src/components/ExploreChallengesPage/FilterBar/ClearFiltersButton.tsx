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
    <Button variant="outline" size="sm" onClick={onClear} className="gap-1.5">
      <X className="h-4 w-4" />
      Clear Filters
    </Button>
  )
}
