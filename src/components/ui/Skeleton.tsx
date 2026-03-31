import { cn } from '@/utils/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800', className)}
      {...props}
    />
  )
}

export { Skeleton }
