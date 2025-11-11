import { Loader } from '@/components/ui/Loader'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
}

export const LoadingOverlay = ({
  isLoading,
  message = 'Loading...',
  className,
}: LoadingOverlayProps) => {
  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm transition-opacity duration-200',
        isLoading ? 'opacity-100' : 'pointer-events-none opacity-0',
        className
      )}
    >
      <Loader message={message} />
    </div>
  )
}
