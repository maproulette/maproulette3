import { Code, Copy, Flag, Heart, MessageSquare, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ChallengeActionButtonsProps {
  isFavorited?: boolean
  isLiked?: boolean
  existingIssue: { html_url: string } | null
  isCheckingIssue: boolean
  hasOverpass?: boolean
  canClone?: boolean
  user: unknown
  onFavorite: () => void
  onLike: () => void
  onReport: () => void
  onComments: () => void
  onOverpass: () => void
  onClone: () => void
}

export const ChallengeActionButtons = ({
  isFavorited,
  isLiked,
  existingIssue,
  isCheckingIssue,
  hasOverpass,
  canClone,
  user,
  onFavorite,
  onLike,
  onReport,
  onComments,
  onOverpass,
  onClone,
}: ChallengeActionButtonsProps) => {
  return (
    <div className="mb-6 grid grid-cols-3 gap-2">
      <Button
        variant={isFavorited ? 'default' : 'outline'}
        size="sm"
        className="gap-2 transition-all hover:scale-105"
        onClick={onFavorite}
      >
        <Star
          className={`size-4 transition-all ${
            isFavorited ? 'fill-yellow-500 text-yellow-500' : ''
          }`}
        />
        {isFavorited ? 'Favorited' : 'Favorite'}
      </Button>
      <Button
        variant={isLiked ? 'default' : 'outline'}
        size="sm"
        className="gap-2 transition-all hover:scale-105"
        onClick={onLike}
      >
        <Heart className={`size-4 transition-all ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
        {isLiked ? 'Liked' : 'Like'}
      </Button>
      {user && (
        <Button
          variant={existingIssue ? 'default' : 'outline'}
          size="sm"
          className={`gap-2 transition-all hover:scale-105 ${
            existingIssue
              ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:text-white dark:hover:bg-red-800'
              : ''
          }`}
          onClick={onReport}
          disabled={isCheckingIssue}
          title={existingIssue ? 'View GitHub issue' : 'Report challenge'}
        >
          <Flag className={`size-4 transition-all ${existingIssue ? 'fill-current' : ''}`} />
          {existingIssue ? 'Reported' : 'Report'}
        </Button>
      )}
      {user && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 transition-all hover:scale-105"
          onClick={onComments}
        >
          <MessageSquare className="size-4" />
          <span>Comments</span>
        </Button>
      )}
      {hasOverpass && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 transition-all hover:scale-105"
          onClick={onOverpass}
        >
          <Code className="size-4" />
          <span>Overpass</span>
        </Button>
      )}
      {canClone && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 transition-all hover:scale-105"
          onClick={onClone}
        >
          <Copy className="size-4" />
          <span>Clone</span>
        </Button>
      )}
    </div>
  )
}
