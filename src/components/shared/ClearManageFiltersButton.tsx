import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ClearManageFiltersButtonProps {
  hasActiveFilters: boolean
  onClear: () => void
}

export const ClearManageFiltersButton = ({
  hasActiveFilters,
  onClear,
}: ClearManageFiltersButtonProps) => {
  return (
    <Button
      size="sm"
      onClick={onClear}
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
