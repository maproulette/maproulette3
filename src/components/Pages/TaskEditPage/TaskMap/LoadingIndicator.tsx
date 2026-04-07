interface LoadingIndicatorProps {
  isLoading: boolean
}

export const LoadingIndicator = ({ isLoading }: LoadingIndicatorProps) => {
  if (!isLoading) {
    return null
  }

  return (
    <div className="-translate-x-1/2 absolute top-4 left-1/2 z-10 rounded bg-white/90 px-3 py-2 text-sm shadow-md dark:bg-zinc-900/90">
      Loading task markers...
    </div>
  )
}
