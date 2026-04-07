import { STATUS_BADGE_COLORS, STATUS_LABELS } from '@/components/taskConstants'

interface TaskStatusBadgeProps {
  status?: number | null
}

export const TaskStatusBadge = ({ status = 0 }: TaskStatusBadgeProps) => {
  const statusValue = status ?? 0
  const label = STATUS_LABELS[statusValue] || 'Unknown'
  const color = STATUS_BADGE_COLORS[statusValue] || STATUS_BADGE_COLORS[0]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold text-xs shadow-sm ${color}`}
    >
      {label}
    </span>
  )
}
