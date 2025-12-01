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
      variant="outline"
      size="sm"
      onClick={onClear}
      className="h-9 gap-1.5 border-zinc-300 text-zinc-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-red-800 dark:hover:bg-red-950/30 dark:hover:text-red-400"
    >
      <X className="h-4 w-4" />
      Clear Filters
    </Button>
  )
}
