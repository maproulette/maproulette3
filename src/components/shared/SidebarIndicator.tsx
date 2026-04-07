import { cn } from '@/lib/utils'

interface SidebarIndicatorProps {
  avatar?: string
  className?: string
}

export const SidebarIndicator = ({ avatar, className }: SidebarIndicatorProps) => {
  if (!avatar) return null

  return (
    <img
      src={avatar}
      alt=""
      className={cn('absolute top-12 right-4 h-12 w-12 rounded-lg object-cover', className)}
    />
  )
}
