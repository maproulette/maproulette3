import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { api } from '@/api'
import { ChallengeCard } from '@/components/shared/ChallengeCard'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/Empty'
import { Loader } from '@/components/ui/Loader'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import type { ViewMode } from '../FilterBar/filterTypes'
import { ChallengesTableView } from './ChallengesTableView'

interface ChallengeListProps {
  viewMode?: ViewMode
}

export const ChallengeList = ({ viewMode = 'grid-map' }: ChallengeListProps) => {
  const { extendedFindParams, isLocationLoading } = useExploreChallengesSearchContext()

  const {
    data: challenges,
    isLoading,
    error,
  } = useQuery({
    ...api.challenge.exploreChallenges(extendedFindParams),
    enabled: !isLocationLoading,
  })

  const showMap = viewMode === 'grid-map'
  const effectiveViewMode = viewMode === 'grid-map' ? 'grid' : viewMode
  const isLoadingState = isLoading || isLocationLoading

  const showEmptyState = !isLoadingState && (!challenges || challenges.length === 0) && !error
  const showErrorState = !isLoadingState && error

  return (
    <div
      className={`relative flex h-full w-full flex-1 flex-col overflow-hidden bg-white ${showMap ? 'md:w-120 md:rounded-bl-lg md:border-zinc-200 md:border-r' : 'md:rounded-b-lg'} dark:border-zinc-800 dark:bg-zinc-950`}
    >
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center bg-white/5 backdrop-blur-sm transition-opacity duration-200 ${
          isLoadingState ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <Loader message="Loading challenges..." />
      </div>

      {showErrorState ? (
        <ScrollArea className="h-full w-full">
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
        <ScrollArea className="h-full w-full">
          <Empty className="p-4">
            <EmptyHeader>
              <EmptyTitle>No challenges found</EmptyTitle>
              <EmptyDescription>Try adjusting your search filters or map bounds.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </ScrollArea>
      ) : challenges && effectiveViewMode === 'list' ? (
        <ChallengesTableView challenges={challenges} />
      ) : challenges ? (
        <ScrollArea className="h-full w-full">
          <div
            className={`w-full gap-4 p-4 ${showMap ? 'flex flex-col' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'}`}
          >
            {challenges.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                className={showMap ? 'min-w-full' : 'min-w-[280px]'}
              />
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  )
}
