import { Badge } from '@/components/ui/Badge'
import { useTaskPreview } from '../TaskPreviewContext'

export const PreviewDiffBadge = () => {
  const { preview, markers } = useTaskPreview()
  const { changedCount } = preview
  if (markers.length === 0) return null
  if (changedCount === 0) {
    return (
      <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400">
        No priority changes
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-amber-700 dark:text-amber-400">
      {changedCount.toLocaleString()} would change priority
    </Badge>
  )
}
