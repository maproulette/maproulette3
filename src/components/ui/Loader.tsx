import { Logomark } from '@/components/ui/Logomark'
import { cn } from '@/lib/utils'

export const Loader = ({
  className,
  message = 'Loading...',
  isFullScreen = false,
  ...props
}: React.ComponentProps<'div'> & {
  message?: string
  isFullScreen?: boolean
}) => (
  <div
    className={cn(
      { 'flex min-h-svh flex-col items-center justify-center': isFullScreen },
      className
    )}
    {...props}
  >
    <div className="inline-flex items-center gap-2">
      <Logomark isAnimated className="size-8" aria-hidden="true" />
      <p className="font-medium text-base">{message}</p>
    </div>
  </div>
)
