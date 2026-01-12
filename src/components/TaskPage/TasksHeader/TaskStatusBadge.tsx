interface TaskStatusBadgeProps {
  status?: number | null
}

const statusLabels: Record<number, { label: string; color: string }> = {
  0: {
    label: 'Created',
    color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  },
  1: {
    label: 'Fixed',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  },
  2: {
    label: 'False Positive',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  },
  3: {
    label: 'Skipped',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  },
  4: {
    label: 'Deleted',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  },
  5: {
    label: 'Too Hard',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  },
  6: {
    label: 'Already Fixed',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  },
}

export const TaskStatusBadge = ({ status = 0 }: TaskStatusBadgeProps) => {
  const statusValue = status ?? 0
  const statusInfo = statusLabels[statusValue] || statusLabels[0]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold text-xs shadow-sm ${statusInfo.color}`}
    >
      {statusInfo.label}
    </span>
  )
}
