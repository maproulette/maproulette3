import { cn } from '@/lib/utils'

export const Skeleton = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    data-slot="skeleton"
    className={cn('animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800', className)}
    {...props}
  />
)
