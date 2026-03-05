import { Link } from '@tanstack/react-router'
import { AlertCircle, CheckCircle2, Copy, Eye, Loader2, MoreHorizontal, Play } from 'lucide-react'
import { useMemo } from 'react'
import { api } from '@/api'
import { ChallengeCard } from '@/components/shared/ChallengeCard'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/Empty'
import { Loader } from '@/components/ui/Loader'
import { ScrollArea } from '@/components/ui/ScrollArea'
import type { Challenge } from '@/types/Challenge'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import type { ViewMode } from '../FilterBar/filterTypes'
import { ChallengesTableView } from './ChallengesTableView'

interface ChallengeListProps {
  viewMode?: ViewMode
}

interface ListFooterProps {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  challengesCount: number
  onLoadMore: () => void
}

const ListFooter = ({
  hasNextPage,
  isFetchingNextPage,
  challengesCount,
  onLoadMore,
}: ListFooterProps) => {
  if (hasNextPage) {
    return (
      <div className="flex justify-center p-4">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={onLoadMore}
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

  if (challengesCount > 0) {
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

export const ChallengeList = ({ viewMode = 'grid-map' }: ChallengeListProps) => {
  const { extendedFindParams, isLocationLoading } = useExploreChallengesSearchContext()

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.challenge.exploreChallengesInfinite(extendedFindParams)

  const challenges = useMemo(() => data?.pages.flat() ?? [], [data])

  const buildChallengeActions = (challenge: Challenge) => {
    const canStart = (challenge.tasksRemaining ?? 0) > 0
    return (
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canStart && (
              <DropdownMenuItem asChild>
                <Link
                  to="/challenge/$challengeId"
                  params={{ challengeId: String(challenge.id) }}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start challenge
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link
                to="/challenge/$challengeId"
                params={{ challengeId: String(challenge.id) }}
                className="flex cursor-pointer items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View challenge
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const url = `${window.location.origin}/challenge/${challenge.id}`
                void navigator.clipboard.writeText(url)
              }}
              className="flex cursor-pointer items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy URL
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  const showMap = viewMode === 'grid-map'
  // Only show full loading overlay on initial load (no data yet), not on background refetches
  const isLoadingState = (isLoading && challenges.length === 0) || isLocationLoading

  const showEmptyState = !isLoadingState && challenges.length === 0 && !error
  const showErrorState = !isLoadingState && error

  return (
    <div className="@container relative flex h-full w-full flex-1 flex-col overflow-hidden bg-zinc-50 dark:bg-slate-950">
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center bg-white/5 backdrop-blur-sm transition-opacity duration-200 ${
          isLoadingState ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <Loader message="Loading challenges..." />
      </div>

      {showErrorState ? (
        <ScrollArea className="h-full w-full [&_[data-slot=scroll-area-scrollbar]]:hidden">
          <Empty className="p-4">
            <EmptyHeader>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <EmptyTitle>Failed to load challenges</EmptyTitle>
              <EmptyDescription>
                {error.message || 'An unexpected error occurred. Please try again.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </ScrollArea>
      ) : showEmptyState ? (
        <ScrollArea className="h-full w-full [&_[data-slot=scroll-area-scrollbar]]:hidden">
          <Empty className="p-4">
            <EmptyHeader>
              <EmptyTitle>No challenges found</EmptyTitle>
              <EmptyDescription>Try adjusting your search filters or map bounds.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </ScrollArea>
      ) : challenges.length > 0 && viewMode === 'list' ? (
        <ChallengesTableView
          challenges={challenges}
          listFooter={
            <ListFooter
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              challengesCount={challenges.length}
              onLoadMore={fetchNextPage}
            />
          }
        />
      ) : challenges.length > 0 ? (
        <ScrollArea className="h-full w-full [&_[data-slot=scroll-area-scrollbar]]:hidden">
          <div
            className={`w-full gap-4 ${showMap ? 'grid @[1100px]:grid-cols-3 @[700px]:grid-cols-2 grid-cols-1' : 'grid'}`}
            style={
              showMap ? undefined : { gridTemplateColumns: 'repeat(auto-fill, minmax(485px, 1fr))' }
            }
          >
            {challenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} actions={buildChallengeActions(c)} />
            ))}
          </div>
          <ListFooter
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            challengesCount={challenges.length}
            onLoadMore={fetchNextPage}
          />
        </ScrollArea>
      ) : null}
    </div>
  )
}
