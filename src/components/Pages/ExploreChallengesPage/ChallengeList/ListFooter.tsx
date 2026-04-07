import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useChallengeResultsContext } from '../contexts/ChallengeResultsContext'

export const ListFooter = () => {
  const { challenges, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useChallengeResultsContext()

  if (hasNextPage) {
    return (
      <div className="flex justify-center p-4">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={fetchNextPage}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Load More'
          )}
        </Button>
      </div>
    )
  }

  if (challenges.length > 0) {
    return (
      <div className="flex flex-col items-center gap-2 border-zinc-200 border-t p-6 text-center dark:border-slate-700">
        <CheckCircle2 className="h-5 w-5 text-zinc-400 dark:text-slate-500" />
        <p className="font-medium text-sm text-zinc-600 dark:text-slate-400">
          You've reached the end of the list
        </p>
        <p className="text-xs text-zinc-500 dark:text-slate-500">
          Adjust your filters or explore a different area to discover more challenges
        </p>
      </div>
    )
  }

  return null
}
