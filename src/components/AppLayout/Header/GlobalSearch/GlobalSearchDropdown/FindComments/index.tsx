import { Link } from '@tanstack/react-router'
import { ChevronRight, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/api'
import type { ChallengeCommentResponse } from '@/api/challenge/comments'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'
import type { Comment } from '@/types/Comment'

const cardClassName = cn(
  'group flex items-start justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4',
  'transition-all duration-200 hover:scale-[1.005] hover:border-zinc-300 hover:shadow-md',
  'dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900'
)

const TaskCommentCard = ({
  comment,
  onResultSelect,
}: {
  comment: Comment
  onResultSelect: () => void
}) => (
  <Link
    to="/tasks/$taskId"
    params={{
      taskId: String(comment.taskId),
    }}
    onClick={onResultSelect}
    className={cardClassName}
  >
    <div className="min-w-0 flex-1 space-y-2">
      <p className="line-clamp-2 text-sm text-zinc-900 dark:text-white">{comment.comment}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 dark:text-slate-400">
          by {comment.osm_username ?? 'Unknown'}
        </span>
        <span className="text-xs text-zinc-400 dark:text-slate-500">Task #{comment.taskId}</span>
      </div>
    </div>
    <ChevronRight className="mt-1 ml-4 h-5 w-5 shrink-0 text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-blue-400" />
  </Link>
)

const ChallengeCommentCard = ({
  comment,
  onResultSelect,
}: {
  comment: ChallengeCommentResponse
  onResultSelect: () => void
}) => (
  <Link
    to="/manage/challenge/$challengeId"
    params={{ challengeId: String(comment.challengeId) }}
    onClick={onResultSelect}
    className={cardClassName}
  >
    <div className="min-w-0 flex-1 space-y-2">
      <p className="line-clamp-2 text-sm text-zinc-900 dark:text-white">{comment.comment}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 dark:text-slate-400">
          by {comment.osm_username ?? 'Unknown'}
        </span>
        <span className="text-xs text-zinc-400 dark:text-slate-500">
          Challenge #{comment.challengeId}
        </span>
      </div>
    </div>
    <ChevronRight className="mt-1 ml-4 h-5 w-5 shrink-0 text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-blue-400" />
  </Link>
)

export const FindComments = ({
  searchQuery = '',
  onResultSelect,
  commentType,
}: {
  searchQuery?: string
  onResultSelect: () => void
  commentType: 'task' | 'challenge'
}) => {
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const trimmed = searchQuery.trim()
  const hasSearchQuery = trimmed.length > 0
  const label = commentType === 'task' ? 'Task' : 'Challenge'

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(trimmed)
    }, 300)
    return () => clearTimeout(timer)
  }, [trimmed])

  // Only fire the relevant query - empty string returns recent comments
  const taskCommentResult = api.task.searchTaskComments({
    q: commentType === 'task' ? debouncedQuery : '',
    enabled: commentType === 'task',
  })
  const challengeCommentResult = api.challenge.searchChallengeComments({
    q: commentType === 'challenge' ? debouncedQuery : '',
    enabled: commentType === 'challenge',
  })

  const searchResult = commentType === 'task' ? taskCommentResult : challengeCommentResult
  const isLoading = searchResult.isLoading
  const isFetching = searchResult.isFetching
  const isDebouncePending = trimmed !== debouncedQuery

  if (commentType === 'task') {
    const results = (taskCommentResult.data ?? []) as Comment[]
    return (
      <div className="space-y-4">
        {/* Loading indicator sticky at top while fetching */}
        {(isFetching || isDebouncePending) && !isLoading && results.length > 0 && (
          <div className="-mx-3 -mt-3 sticky top-0 z-10 flex items-center justify-center gap-2 bg-white/90 py-2 backdrop-blur-sm dark:bg-slate-950/90">
            <Spinner className="h-4 w-4 text-blue-500" />
            <p className="text-xs text-zinc-500 dark:text-slate-400">Updating results...</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Spinner className="h-8 w-8 text-blue-500" />
            <p className="text-sm text-zinc-500 dark:text-slate-400">Loading comments...</p>
          </div>
        ) : results.length === 0 ? (
          <EmptyState label={label} query={debouncedQuery} hasSearchQuery={hasSearchQuery} />
        ) : (
          <ResultsWrapper count={results.length} hasSearchQuery={hasSearchQuery} label={label}>
            {results.map((comment) => (
              <TaskCommentCard key={comment.id} comment={comment} onResultSelect={onResultSelect} />
            ))}
          </ResultsWrapper>
        )}
      </div>
    )
  }

  const results = (challengeCommentResult.data ?? []) as ChallengeCommentResponse[]
  return (
    <div className="space-y-4">
      {/* Loading indicator at top while fetching */}
      {(isFetching || isDebouncePending) && !isLoading && results.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-2">
          <Spinner className="h-4 w-4 text-blue-500" />
          <p className="text-xs text-zinc-500 dark:text-slate-400">Updating results...</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Spinner className="h-8 w-8 text-blue-500" />
          <p className="text-sm text-zinc-500 dark:text-slate-400">Loading comments...</p>
        </div>
      ) : results.length === 0 ? (
        <EmptyState label={label} query={debouncedQuery} hasSearchQuery={hasSearchQuery} />
      ) : (
        <ResultsWrapper count={results.length} hasSearchQuery={hasSearchQuery} label={label}>
          {results.map((comment) => (
            <ChallengeCommentCard
              key={comment.id}
              comment={comment}
              onResultSelect={onResultSelect}
            />
          ))}
        </ResultsWrapper>
      )}
    </div>
  )
}

const EmptyState = ({
  label,
  query,
  hasSearchQuery,
}: {
  label: string
  query: string
  hasSearchQuery: boolean
}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12">
    <div className="rounded-full bg-zinc-100 p-3 dark:bg-slate-800">
      <MessageCircle className="h-6 w-6 text-zinc-400 dark:text-slate-500" />
    </div>
    <div className="space-y-1 text-center">
      <p className="font-medium text-sm text-zinc-900 dark:text-white">
        {hasSearchQuery ? 'No results found' : `No ${label.toLowerCase()} comments yet`}
      </p>
      {hasSearchQuery && (
        <p className="text-xs text-zinc-500 dark:text-slate-400">
          No {label.toLowerCase()} comments match &quot;{query}&quot;
        </p>
      )}
    </div>
  </div>
)

const ResultsWrapper = ({
  count,
  hasSearchQuery,
  label,
  children,
}: {
  count: number
  hasSearchQuery: boolean
  label: string
  children: React.ReactNode
}) => (
  <div className="space-y-4">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-semibold text-sm text-zinc-700 dark:text-slate-300">
        {hasSearchQuery ? 'Results' : `Recent ${label} Comments`}
      </h3>
      <span className="text-xs text-zinc-500 dark:text-slate-400">
        {count} comment{count !== 1 ? 's' : ''}
      </span>
    </div>
    <div className="space-y-2">{children}</div>
  </div>
)
