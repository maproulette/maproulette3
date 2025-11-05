import { Link } from '@tanstack/react-router'
import { ChevronRight, Search } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'

export const ChallengeResultsSection = ({
  results,
  isLoading,
  isFetching,
  isLoadingMore,
  onResultSelect,
  onLoadMore,
  hasMore,
}: {
  results: (Challenge | string)[]
  isLoading: boolean
  isFetching?: boolean
  isLoadingMore?: boolean
  onResultSelect?: () => void
  onLoadMore?: () => void
  hasMore?: boolean
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loadMoreRef.current || !onLoadMore || !hasMore || isFetching) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [onLoadMore, hasMore, isFetching])

  return (
    <div className="relative">
      {/* Loading overlay when fetching more results */}
      {isLoadingMore && isFetching && results.length > 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="h-8 w-8 text-blue-500" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading more challenges...</p>
          </div>
        </div>
      )}

      <div className="space-y-3 pb-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Spinner className="h-8 w-8 text-blue-500" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading challenges...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
              <Search className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="space-y-1 text-center">
              <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                No challenges found
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Try adjusting your filters</p>
            </div>
          </div>
        ) : (
          <>
            {results.map((result: Challenge | string) =>
              typeof result === 'string' ? (
                <Link
                  key={result}
                  to="/challenges"
                  search={Object.fromEntries(new URL(result).searchParams)}
                  onClick={onResultSelect}
                  className={cn(
                    'group flex items-center justify-between rounded-xl px-4 py-3.5',
                    'border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50',
                    'transition-all duration-200 hover:scale-[1.01] hover:border-blue-300 hover:shadow-lg',
                    'dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30',
                    'dark:hover:border-blue-700 dark:hover:from-blue-950/50 dark:hover:to-indigo-950/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500 p-2 text-white shadow-sm">
                      <Search className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-blue-700 text-sm group-hover:text-blue-800 dark:text-blue-300 dark:group-hover:text-blue-200">
                      View filtered results on the explore page
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-blue-500 transition-transform group-hover:translate-x-1 dark:text-blue-400" />
                </Link>
              ) : (
                <Link
                  key={result.id}
                  to="/challenges/$challengeId"
                  params={{ challengeId: String(result.id) }}
                  onClick={onResultSelect}
                  className={cn(
                    'group flex items-start justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4',
                    'transition-all duration-200 hover:scale-[1.005] hover:border-zinc-300 hover:shadow-lg',
                    'dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900'
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <h3 className="font-semibold text-base text-zinc-900 transition-colors group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                      {result.name}
                    </h3>
                    {result.description && (
                      <p className="line-clamp-2 text-sm text-zinc-600 leading-relaxed dark:text-zinc-400">
                        {result.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="mt-1 ml-4 h-5 w-5 shrink-0 text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-blue-500 dark:text-zinc-500 dark:group-hover:text-blue-400" />
                </Link>
              )
            )}

            {/* Intersection observer target */}
            {hasMore && <div ref={loadMoreRef} className="h-4" />}

            {/* No more challenges indicator */}
            {!hasMore && !isLoading && results.length > 1 && (
              <div className="mt-4 flex justify-center rounded-b-xl border-zinc-200 border-t-2 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-1.5 w-16 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                  <div className="space-y-1 text-center">
                    <p className="font-semibold text-base text-zinc-800 dark:text-zinc-200">
                      That's all!
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      No more challenges to load
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
