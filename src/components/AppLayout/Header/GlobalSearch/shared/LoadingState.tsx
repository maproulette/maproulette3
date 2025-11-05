import { Spinner } from '@/components/ui/Spinner'

interface LoadingStateProps {
  message?: string
}

export const LoadingState = ({ message = 'Loading...' }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Spinner className="h-8 w-8 text-emerald-600" />
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  )
}
