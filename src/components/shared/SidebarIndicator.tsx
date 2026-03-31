import { cn } from '@/utils/utils'

const getSidebarColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-blue-500'
  if (percentage >= 50) return 'bg-orange-500'
  if (percentage >= 25) return 'bg-yellow-500'
  return 'bg-red-500'
}

interface SidebarIndicatorProps {
  percentage: number
  className?: string
}

export const SidebarIndicator = ({ percentage, className }: SidebarIndicatorProps) => {
  const color = getSidebarColor(percentage)

  return (
    <div className={cn('absolute top-12 right-4 h-12 w-12 rounded-lg', color, className)} />
  )
}
