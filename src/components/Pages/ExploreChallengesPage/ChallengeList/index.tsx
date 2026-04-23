import { AlertCircle } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { ChallengeCard } from '@/components/shared/ChallengeCard'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/Empty'
import { Loader } from '@/components/ui/Loader'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'
import { useChallengeResultsContext } from '../contexts/ChallengeResultsContext'
import { useExploreChallengesSearchContext } from '../contexts/ExploreChallengesSearchContext'
import { useMapListHover } from '../contexts/MapListHoverContext'
import { ChallengeActionMenu } from './ChallengeActionMenu'
import { ChallengesTableView } from './ChallengesTableView'
import { ListFooter } from './ListFooter'

export const ChallengeList = () => {
  const { viewMode } = useExploreChallengesSearchContext()
  const { challenges, error, isLoadingState, showEmptyState, showErrorState } =
    useChallengeResultsContext()

  return (
    <div className="@container relative flex h-full w-full flex-1 flex-col overflow-hidden bg-zinc-50 dark:bg-slate-950">
      <div
        className={cn(
          'absolute inset-0 z-10 flex items-center justify-center bg-white/5 backdrop-blur-sm transition-opacity duration-200',
          isLoadingState ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
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
                {error?.message || 'An unexpected error occurred. Please try again.'}
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
        <>
          <ChallengesTableView />
          <ListFooter />
        </>
      ) : challenges.length > 0 ? (
        <ScrollArea className="h-full w-full [&_[data-slot=scroll-area-scrollbar]]:hidden">
          <div
            className={cn(
              'w-full gap-4',
              viewMode === 'grid-map'
                ? 'grid @[1100px]:grid-cols-3 @[700px]:grid-cols-2 grid-cols-1'
                : 'grid'
            )}
            style={
              viewMode === 'grid-map'
                ? undefined
                : { gridTemplateColumns: 'repeat(auto-fill, minmax(485px, 1fr))' }
            }
          >
            {challenges.map((c) => (
              <HoverSyncedChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
          <ListFooter />
        </ScrollArea>
      ) : null}
    </div>
  )
}

/**
 * Wraps a `ChallengeCard` so that list-row hover syncs to the map marker and
 * map-marker hover scrolls the matching card into view. The outer wrapper
 * handles mouse events (the `ChallengeCard` itself is a `<Link>` and doesn't
 * forward arbitrary DOM handlers).
 */
const HoverSyncedChallengeCard = ({ challenge }: { challenge: Challenge }) => {
  const { hoveredChallengeId, hoverSource, setHoveredFromList, clearHover } = useMapListHover()
  const ref = useRef<HTMLDivElement | null>(null)
  const isHovered = hoveredChallengeId === challenge.id

  useEffect(() => {
    // Only scroll from map-originated hover to avoid fighting the user's mouse.
    if (hoverSource !== 'map' || !isHovered || !ref.current) return
    ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [hoverSource, isHovered])

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover sync only; inner ChallengeCard handles navigation/keyboard
    <div
      ref={ref}
      onMouseEnter={() => setHoveredFromList(challenge.id)}
      onMouseLeave={() => clearHover()}
      className={cn(
        'rounded-xl transition-all',
        isHovered &&
          'ring-2 ring-green-500 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-slate-950'
      )}
    >
      <ChallengeCard
        challenge={challenge}
        actions={<ChallengeActionMenu challenge={challenge} />}
      />
    </div>
  )
}
