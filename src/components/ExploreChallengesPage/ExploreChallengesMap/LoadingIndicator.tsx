interface LoadingIndicatorProps {
  isLoading: boolean
  message: string
}

export const LoadingIndicator = ({ isLoading, message }: LoadingIndicatorProps) => {
  return (
    <div
      className={`-translate-x-1/2 absolute top-3 left-1/2 z-[1000] transform transition-all duration-500 ease-in-out md:top-4 ${
        isLoading ? 'translate-y-0 opacity-100' : '-translate-y-4 pointer-events-none opacity-0'
      }`}
    >
      <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap font-medium text-xs text-zinc-900 dark:text-zinc-100">
            {message}
          </span>
        </div>
      </div>
    </div>
  )
}
