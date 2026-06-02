import { Link } from '@tanstack/react-router'
import { Bookmark, Heart, MessageSquare, Share2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { useBrowsedChallengeContext } from '@/components/Pages/BrowsedChallengePage/contexts/BrowsedChallengeContext'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { ChallengeActionButtons } from './ChallengeActionButtons'
import { useChallengeModals } from './ChallengeModals/ChallengeModalsContext'

interface ChallengeHeaderProps {
  isScrolled?: boolean
}

const COOPERATIVE_TYPE_TAGS = 1
const COOPERATIVE_TYPE_CHANGEFILE = 2

const DisabledTooltip = ({
  show,
  message,
  className,
  children,
}: {
  show: boolean
  message: string
  className?: string
  children: ReactNode
}) => {
  if (!show) return <>{children}</>
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-flex', className)}>{children}</span>
      </TooltipTrigger>
      <TooltipContent>{message}</TooltipContent>
    </Tooltip>
  )
}

export const ChallengeHeader = ({ isScrolled = false }: ChallengeHeaderProps) => {
  const {
    projectId,
    challenge,
    isFavorited,
    isLiked,
    projectName,
    ownerName,
    formattedDate,
    user,
  } = useBrowsedChallengeContext()
  const name = challenge.name
  const { openComments } = useChallengeModals()
  const needsSignIn = !user?.id
  const likeSignInMsg = 'Sign in to like challenges'
  const saveSignInMsg = 'Sign in to save challenges'

  const favoriteMutation = api.challenge.useFavoriteChallenge()
  const unfavoriteMutation = api.challenge.useUnfavoriteChallenge()
  const likeMutation = api.challenge.useLikeChallenge()
  const unlikeMutation = api.challenge.useUnlikeChallenge()

  const { data: likeCountData } = api.challenge.getChallengeLikeCount(challenge.id ?? 0)
  const likeCount = likeCountData?.likeCount ?? 0

  const handleFavorite = async () => {
    if (!challenge.id) return
    if (!user?.id) {
      toast.error('Please sign in to save challenges')
      return
    }

    try {
      if (isFavorited) {
        await unfavoriteMutation.mutateAsync(challenge.id)
        toast.success('Removed from favorites')
      } else {
        await favoriteMutation.mutateAsync(challenge.id)
        toast.success('Added to favorites')
      }
    } catch (error) {
      logger.error('Error toggling favorite', { error })
      toast.error('Failed to update favorite status')
    }
  }

  const handleLike = async () => {
    if (!challenge.id) return
    if (!user?.id) {
      toast.error('Please sign in to like challenges')
      return
    }

    try {
      if (isLiked) {
        await unlikeMutation.mutateAsync(challenge.id)
        toast.success('Like removed')
      } else {
        await likeMutation.mutateAsync(challenge.id)
        toast.success('Challenge liked!')
      }
    } catch (error) {
      logger.error('Error toggling like', { error })
      toast.error('Failed to update like status')
    }
  }

  const handleShare = async () => {
    if (!challenge.id) return

    const url = `${window.location.origin}/challenge/${challenge.id}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          text: `Check out this challenge: ${name}`,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard')
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(url)
          toast.success('Link copied to clipboard')
        } catch (clipboardError) {
          logger.error('Error copying to clipboard', { error: clipboardError })
          toast.error('Failed to share challenge')
        }
      }
    }
  }

  const taxonomyItems: Array<{ label: string; className: string }> = []

  if (isFavorited) {
    taxonomyItems.push({
      label: 'Favorite',
      className: 'text-pink-500 dark:text-pink-400',
    })
  }

  if (challenge.featured) {
    taxonomyItems.push({
      label: 'Featured',
      className: 'text-cyan-500 dark:text-cyan-400',
    })
  }

  if (challenge.popularity && challenge.popularity > 0) {
    taxonomyItems.push({
      label: 'Popular',
      className: 'text-orange-500 dark:text-orange-400',
    })
  }

  const isNewest = challenge.created && Date.now() - challenge.created < 30 * 24 * 60 * 60 * 1000

  if (isNewest) {
    taxonomyItems.push({
      label: 'Newest',
      className: 'text-yellow-500 dark:text-yellow-400',
    })
  }

  if (challenge.cooperativeType === COOPERATIVE_TYPE_TAGS) {
    taxonomyItems.push({
      label: 'Tag Fix',
      className: 'text-rose-500 dark:text-rose-400',
    })
  }

  if (challenge.cooperativeType === COOPERATIVE_TYPE_CHANGEFILE) {
    taxonomyItems.push({
      label: 'Cooperative',
      className: 'text-rose-500 dark:text-rose-400',
    })
  }

  return (
    <div
      className={cn(
        'transition-all duration-500 ease-in-out',
        isScrolled ? 'mb-0 min-w-0 flex-1' : 'mb-6 w-full space-y-2.5'
      )}
    >
      {/* Taxonomy and Actions Row */}
      {!isScrolled && taxonomyItems.length > 0 && (
        <div className="flex items-center justify-between gap-2">
          <ul className="flex flex-wrap items-center gap-2.5">
            {taxonomyItems.map((item) => (
              <li key={item.label}>
                <span className={cn('font-medium text-xs uppercase tracking-wide', item.className)}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
          <div
            className="relative z-10 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="toolbar"
          >
            <ChallengeActionButtons />
          </div>
        </div>
      )}

      {/* Show ellipsis even when no taxonomy items */}
      {!isScrolled && taxonomyItems.length === 0 && (
        <div className="flex items-center justify-end">
          <div
            className="relative z-10 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="toolbar"
          >
            <DisabledTooltip show={needsSignIn} message={saveSignInMsg}>
              <Button
                variant={isFavorited ? 'default' : 'outline'}
                size="sm"
                className="gap-1.5 rounded-full"
                onClick={handleFavorite}
                disabled={needsSignIn}
              >
                <Bookmark
                  className={cn(
                    'size-4 transition-all',
                    isFavorited && 'fill-yellow-500 text-yellow-500'
                  )}
                />
                {isFavorited ? 'Saved' : 'Save'}
              </Button>
            </DisabledTooltip>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleShare}
              aria-label="Share challenge"
            >
              <Share2 className="size-4" />
            </Button>
            <ChallengeActionButtons />
          </div>
        </div>
      )}

      {/* Title Row - with ellipsis on opposite side when scrolled */}
      <div
        className={cn('flex items-center gap-2', isScrolled ? 'justify-between' : 'justify-start')}
      >
        <h1
          className={cn(
            'min-w-0 font-bold text-zinc-900 leading-tight tracking-tight transition-all duration-500 ease-in-out dark:text-white',
            isScrolled
              ? 'flex-1 truncate text-base'
              : 'line-clamp-2 w-full text-left font-semibold text-base'
          )}
        >
          {name}
        </h1>
        {isScrolled && (
          <div
            className="relative z-10 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="toolbar"
          >
            <DisabledTooltip show={needsSignIn} message={likeSignInMsg}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleLike}
                disabled={needsSignIn}
                aria-label={isLiked ? 'Unlike challenge' : 'Like challenge'}
              >
                <Heart
                  className={cn('size-4 transition-all', isLiked && 'fill-red-500 text-red-500')}
                />
              </Button>
            </DisabledTooltip>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={openComments}
              aria-label="View comments"
            >
              <MessageSquare className="size-4" />
            </Button>
            <DisabledTooltip show={needsSignIn} message={saveSignInMsg}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleFavorite}
                disabled={needsSignIn}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Bookmark
                  className={cn(
                    'size-4 transition-all',
                    isFavorited && 'fill-yellow-500 text-yellow-500'
                  )}
                />
              </Button>
            </DisabledTooltip>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleShare}
              aria-label="Share challenge"
            >
              <Share2 className="size-4" />
            </Button>
            <ChallengeActionButtons />
          </div>
        )}
      </div>

      {!isScrolled && (
        <>
          <div className="max-h-20 overflow-hidden opacity-100 transition-all duration-500 ease-in-out">
            {(projectName || ownerName || formattedDate) && (
              <div
                className="flex flex-wrap items-center gap-x-2.5 gap-y-0 font-medium text-xs text-zinc-600 dark:text-slate-400"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                  }
                }}
                role="toolbar"
              >
                {projectName && projectId ? (
                  <>
                    <Link
                      to="/project/$projectId"
                      params={{ projectId: String(projectId) }}
                      className="font-medium transition-colors hover:text-zinc-900 dark:hover:text-slate-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {projectName}
                    </Link>
                    {(ownerName || formattedDate || likeCount > 0) && (
                      <span className="text-zinc-400 dark:text-white0">•</span>
                    )}
                  </>
                ) : projectName ? (
                  <>
                    <span className="font-medium">{projectName}</span>
                    {(ownerName || formattedDate || likeCount > 0) && (
                      <span className="text-zinc-400 dark:text-white0">•</span>
                    )}
                  </>
                ) : null}
                {ownerName && (
                  <>
                    <span className="whitespace-nowrap">
                      by{' '}
                      <a
                        href={`https://www.openstreetmap.org/user/${encodeURIComponent(ownerName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium transition-colors hover:text-zinc-900 dark:hover:text-slate-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {ownerName}
                      </a>
                    </span>
                    {(formattedDate || likeCount > 0) && (
                      <span className="text-zinc-400 dark:text-white0">•</span>
                    )}
                  </>
                )}
                {formattedDate && (
                  <>
                    <span className="whitespace-nowrap">{formattedDate}</span>
                    {likeCount > 0 && <span className="text-zinc-400 dark:text-white0">•</span>}
                  </>
                )}
                {likeCount > 0 && (
                  <span className="whitespace-nowrap">
                    {likeCount === 1 ? '1 like' : `${likeCount} likes`}
                  </span>
                )}
              </div>
            )}
          </div>
          {/* Like, Comments, Save, and Share Buttons - Bottom of Header */}
          <div
            className="relative z-10 mt-4 grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="toolbar"
          >
            <DisabledTooltip
              show={needsSignIn}
              message={likeSignInMsg}
              className="w-full sm:w-auto"
            >
              <Button
                variant={isLiked ? 'default' : 'outline'}
                size="sm"
                className="w-full gap-1.5 whitespace-nowrap rounded-full sm:w-auto"
                onClick={handleLike}
                disabled={needsSignIn}
              >
                <Heart
                  className={cn('size-4 transition-all', isLiked && 'fill-red-500 text-red-500')}
                />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
            </DisabledTooltip>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 whitespace-nowrap rounded-full sm:w-auto"
              onClick={openComments}
            >
              <MessageSquare className="size-3.5" />
              Comments
            </Button>
            <DisabledTooltip
              show={needsSignIn}
              message={saveSignInMsg}
              className="w-full sm:w-auto"
            >
              <Button
                variant={isFavorited ? 'default' : 'outline'}
                size="sm"
                className="w-full gap-1.5 whitespace-nowrap rounded-full sm:w-auto"
                onClick={handleFavorite}
                disabled={needsSignIn}
              >
                <Bookmark
                  className={cn(
                    'size-4 transition-all',
                    isFavorited && 'fill-yellow-500 text-yellow-500'
                  )}
                />
                {isFavorited ? 'Saved' : 'Save'}
              </Button>
            </DisabledTooltip>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 whitespace-nowrap rounded-full sm:w-auto"
              onClick={handleShare}
            >
              <Share2 className="size-3.5" />
              Share
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
