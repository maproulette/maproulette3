import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  enabled: boolean
  className?: string
}

export const StatusBadge = ({ enabled, className }: StatusBadgeProps) => {
  return (
    <Badge
      className={cn(
        enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : '',
        className
      )}
      variant={enabled ? 'default' : 'secondary'}
    >
      {enabled ? 'Enabled' : 'Disabled'}
    </Badge>
  )
}
