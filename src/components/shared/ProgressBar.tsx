import { cn } from '@/utils/utils'

const getProgressBarColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-blue-500'
  if (percentage >= 50) return 'bg-orange-500'
  return 'bg-red-500'
}

interface ProgressBarProps {
  percentage: number
  className?: string
}

export const ProgressBar = ({ percentage, className }: ProgressBarProps) => {
  const color = getProgressBarColor(percentage)

  return (
    <div
      className={cn(
        'h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-slate-500',
        className,
      )}
    >
      <div
        className={cn('h-full transition-all duration-300', color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
