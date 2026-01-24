import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Bookmark, Heart, MessageSquare, Share2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { useBrowsedChallengeContext } from '@/components/BrowsedChallengePage/contexts/BrowsedChallengeContext'
import { Button } from '@/components/ui/Button'
import { ChallengeActionButtons } from './ChallengeActionButtons'
import { ChallengeModals } from './ChallengeModals'

interface ChallengeHeaderProps {
  name: string
  projectName?: string | null
  ownerName?: string
  formattedDate?: string | null
  isScrolled?: boolean
}

// Cooperative type constants
const COOPERATIVE_TYPE_TAGS = 1
const COOPERATIVE_TYPE_CHANGEFILE = 2

export const ChallengeHeader = ({
  name,
  projectName,
  ownerName,
  formattedDate,
  isScrolled = false,
}: ChallengeHeaderProps) => {
  const { projectId, challenge, isFavorited, user, isLiked } = useBrowsedChallengeContext()
  const queryClient = useQueryClient()
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)

  const { data: likeCountData } = api.challenge.getChallengeLikeCount(challenge.id ?? 0)
  const likeCount = likeCountData?.likeCount ?? 0

  const handleFavorite = async () => {
    if (!challenge.id) return

    try {
      if (isFavorited) {
        await api.challenge.unfavoriteChallenge(challenge.id)
        toast.success('Removed from favorites')
      } else {
        await api.challenge.favoriteChallenge(challenge.id)
        toast.success('Added to favorites')
      }

      await queryClient.invalidateQueries({
        queryKey: ['challenge', challenge.id, 'isFavorited'],
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite status')
    }
  }

  const handleLike = async () => {
    if (!challenge.id) return

    try {
      if (isLiked) {
        await api.challenge.unlikeChallenge(challenge.id)
        toast.success('Like removed')
      } else {
        await api.challenge.likeChallenge(challenge.id)
        toast.success('Challenge liked!')
      }

      await queryClient.invalidateQueries({
        queryKey: ['challenge', challenge.id, 'isLiked'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['challenge', challenge.id, 'likeCount'],
      })
    } catch (error) {
      console.error('Error toggling like:', error)
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
      // User cancelled share or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        // Fallback to clipboard if share fails
        try {
          await navigator.clipboard.writeText(url)
          toast.success('Link copied to clipboard')
        } catch (clipboardError) {
          console.error('Error copying to clipboard:', clipboardError)
          toast.error('Failed to share challenge')
        }
      }
    }
  }

  // Build taxonomy items similar to Taxonomy component
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

  // Check if challenge is "newest" - created within last 30 days
  const isNewest =
    challenge.created &&
    (typeof challenge.created === 'number'
      ? Date.now() - challenge.created * 1000 < 30 * 24 * 60 * 60 * 1000
      : Date.now() - new Date(challenge.created).getTime() < 30 * 24 * 60 * 60 * 1000)

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
      className={`transition-all duration-500 ease-in-out ${isScrolled ? 'mb-0 min-w-0 flex-1' : 'mb-6 w-full space-y-2.5'}`}
    >
      {/* Taxonomy and Actions Row */}
      {!isScrolled && taxonomyItems.length > 0 && (
        <div className="flex items-center justify-between gap-2">
          <ul className="flex flex-wrap items-center gap-2.5">
            {taxonomyItems.map((item) => (
              <li key={item.label}>
                <span className={`font-medium text-xs uppercase tracking-wide ${item.className}`}>
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
            <Button
              variant={isFavorited ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={handleFavorite}
            >
              <Bookmark
                className={`size-4 transition-all ${
                  isFavorited ? 'fill-yellow-500 text-yellow-500' : ''
                }`}
              />
              {isFavorited ? 'Saved' : 'Save'}
            </Button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:text-zinc-400 dark:focus:ring-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label="Share challenge"
            >
              <Share2 className="size-4" />
            </button>
            <ChallengeActionButtons />
          </div>
        </div>
      )}

      {/* Title Row - with ellipsis on opposite side when scrolled */}
      <div
        className={`flex items-center gap-2 ${isScrolled ? 'justify-between' : 'justify-start'}`}
      >
        <h1
          className={`min-w-0 font-bold text-zinc-900 leading-tight tracking-tight transition-all duration-500 ease-in-out dark:text-zinc-50 ${
            isScrolled ? 'flex-1 truncate text-base' : 'line-clamp-2 w-full text-left text-2xl'
          }`}
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
            <button
              type="button"
              onClick={handleLike}
              className="flex items-center justify-center rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:text-zinc-400 dark:focus:ring-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label={isLiked ? 'Unlike challenge' : 'Like challenge'}
            >
              <Heart
                className={`size-4 transition-all ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
              />
            </button>
            {!!user && (
              <button
                type="button"
                onClick={() => setIsCommentsModalOpen(true)}
                className="flex items-center justify-center rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:text-zinc-400 dark:focus:ring-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                aria-label="View comments"
              >
                <MessageSquare className="size-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleFavorite}
              className="flex items-center justify-center rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:text-zinc-400 dark:focus:ring-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Bookmark
                className={`size-4 transition-all ${
                  isFavorited ? 'fill-yellow-500 text-yellow-500' : ''
                }`}
              />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:text-zinc-400 dark:focus:ring-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label="Share challenge"
            >
              <Share2 className="size-4" />
            </button>
            <ChallengeActionButtons />
          </div>
        )}
      </div>

      {!isScrolled && (
        <>
          <div className="max-h-20 overflow-hidden opacity-100 transition-all duration-500 ease-in-out">
            {(projectName || ownerName || formattedDate) && (
              <div
                className="flex flex-wrap items-center gap-x-2.5 gap-y-0 font-medium text-xs text-zinc-600 dark:text-zinc-400"
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
                      className="font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {projectName}
                    </Link>
                    {(ownerName || formattedDate || likeCount > 0) && (
                      <span className="text-zinc-400 dark:text-zinc-500">•</span>
                    )}
                  </>
                ) : projectName ? (
                  <>
                    <span className="font-medium">{projectName}</span>
                    {(ownerName || formattedDate || likeCount > 0) && (
                      <span className="text-zinc-400 dark:text-zinc-500">•</span>
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
                        className="font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {ownerName}
                      </a>
                    </span>
                    {(formattedDate || likeCount > 0) && (
                      <span className="text-zinc-400 dark:text-zinc-500">•</span>
                    )}
                  </>
                )}
                {formattedDate && (
                  <>
                    <span className="whitespace-nowrap">{formattedDate}</span>
                    {likeCount > 0 && <span className="text-zinc-400 dark:text-zinc-500">•</span>}
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
            <Button
              variant={isLiked ? 'default' : 'outline'}
              size="sm"
              className="w-full gap-1.5 whitespace-nowrap sm:w-auto"
              onClick={handleLike}
            >
              <Heart
                className={`size-4 transition-all ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
              />
              {isLiked ? 'Liked' : 'Like'}
            </Button>
            {!!user && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 whitespace-nowrap sm:w-auto"
                onClick={() => setIsCommentsModalOpen(true)}
              >
                <MessageSquare className="size-3.5" />
                Comments
              </Button>
            )}
            <Button
              variant={isFavorited ? 'default' : 'outline'}
              size="sm"
              className="w-full gap-1.5 whitespace-nowrap sm:w-auto"
              onClick={handleFavorite}
            >
              <Bookmark
                className={`size-4 transition-all ${
                  isFavorited ? 'fill-yellow-500 text-yellow-500' : ''
                }`}
              />
              {isFavorited ? 'Saved' : 'Save'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 whitespace-nowrap sm:w-auto"
              onClick={handleShare}
            >
              <Share2 className="size-3.5" />
              Share
            </Button>
          </div>
        </>
      )}

      <ChallengeModals
        isReportModalOpen={false}
        isCommentsModalOpen={isCommentsModalOpen}
        isOverpassModalOpen={false}
        isCloneModalOpen={false}
        onReportModalChange={() => {}}
        onCommentsModalChange={setIsCommentsModalOpen}
        onOverpassModalChange={() => {}}
        onCloneModalChange={() => {}}
        onReportSuccess={() => {}}
      />
    </div>
  )
}
