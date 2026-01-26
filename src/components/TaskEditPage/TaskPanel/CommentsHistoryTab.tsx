import { MessageSquare, Send } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Textarea } from '@/components/ui/Textarea'
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import type { Task, TaskHistoryAction } from '@/types/Task'

interface CommentsHistoryTabProps {
  task: Task
}

// Action types from the API
const ACTION_TYPE = {
  UPDATED: 0,
  CREATED: 1,
  STATUS_CHANGE: 2,
  COMMENT: 3,
  REVIEW_STATUS_CHANGE: 4,
  META_REVIEW_STATUS_CHANGE: 5,
} as const

const STATUS_LABELS: Record<number, string> = {
  0: 'Created',
  1: 'Fixed',
  2: 'False Positive',
  3: 'Skipped',
  4: 'Deleted',
  5: 'Already Fixed',
  6: 'Too Hard',
}

export const CommentsHistoryTab = ({ task }: CommentsHistoryTabProps) => {
  const { user } = useAuthContext()
  const [commentText, setCommentText] = useState('')
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: taskHistory = [], isLoading } = api.task.getTaskHistory(task.id)
  const addCommentMutation = api.task.useAddTaskComment()

  const handleImageError = (avatarUrl: string) => {
    if (!failedImages.has(avatarUrl)) {
      setFailedImages((prev) => new Set(prev).add(avatarUrl))
    }
  }

  const getImageSrc = (avatarUrl?: string) => {
    if (!avatarUrl || failedImages.has(avatarUrl) || avatarUrl.includes('user_no_image')) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEOUQ5REUiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjc2MTQgMTAgMjUgMTIuMjM4NiAyNSAxNUMgMjUgMTcuNzYxNCMyMi43NjE0IDIwIDIwIDIwQzE3LjIzODYgMjAgMTUgMTcuNzYxNCAxNSAxNUMgMTUgMTIuMjM4NiAxNy4yMzg2IDEwIDIwIDEwWk0yMCAyMkMyMy4zMTM3IDIyIDI2IDI0LjY4NjMgMjYgMjhWMjlIMTZWMjhDMTYgMjQuNjg2MyAxOC42ODYzIDIyIDIyIDIySDIwWiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4K'
    }
    return avatarUrl
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) {
      toast.error('Please enter a comment')
      return
    }
    if (!user) {
      toast.error('You must be logged in to comment')
      return
    }
    addCommentMutation.mutate(
      { taskId: task.id, commentText: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText('')
          toast.success('Comment added')
        },
        onError: (error) => {
          console.error('Error adding comment:', error)
          toast.error('Failed to add comment')
        },
      }
    )
  }

  const userOsmId = user?.osmProfile?.id

  // Sort history by timestamp (oldest first)
  const sortedHistory = useMemo(() => {
    return [...taskHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [taskHistory])

  const renderHistoryItem = (item: TaskHistoryAction, index: number) => {
    const timestamp = new Date(item.timestamp)
    const userName = item.user?.osmProfile?.displayName ?? 'System'
    const avatarUrl = item.user?.osmProfile?.avatarURL

    // Skip UPDATED actions (type 0) - they're not useful to display
    if (item.actionType === ACTION_TYPE.UPDATED) {
      return null
    }

    // Comment action - handle both string and object comment formats
    if (item.actionType === ACTION_TYPE.COMMENT && item.comment) {
      // Comment can be a string or an object
      const commentText = typeof item.comment === 'string' ? item.comment : item.comment.comment
      const commentObj = typeof item.comment === 'object' ? item.comment : null
      const commentUserName = commentObj?.osm_username ?? userName
      const commentAvatarUrl = commentObj?.avatarUrl ?? avatarUrl
      const isUser = commentObj ? commentObj.osm_id === userOsmId : false

      return (
        <div
          key={`comment-${index}`}
          className={cn('flex min-w-0 gap-2', isUser && 'flex-row-reverse')}
        >
          <div className="flex-shrink-0">
            <img
              src={getImageSrc(commentAvatarUrl)}
              alt={commentUserName}
              className="size-8 rounded-full border border-zinc-200 dark:border-zinc-700"
              onError={() => commentAvatarUrl && handleImageError(commentAvatarUrl)}
              loading="lazy"
            />
          </div>

          <div
            className={cn(
              'flex min-w-0 flex-1 flex-col gap-1 rounded-lg p-2.5',
              isUser ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-zinc-100 dark:bg-zinc-800'
            )}
          >
            <div className="flex items-center gap-2">
              <a
                href={`https://www.openstreetmap.org/user/${encodeURIComponent(commentUserName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 text-xs hover:underline dark:text-blue-400"
              >
                {commentUserName}
              </a>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none break-words text-xs [&_*]:break-words [&_a]:text-blue-600 [&_a]:hover:underline dark:[&_a]:text-blue-400">
              <ReactMarkdown
                components={{
                  a: ({ ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    />
                  ),
                }}
              >
                {commentText}
              </ReactMarkdown>
            </div>

            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {timestamp.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      )
    }

    // Status change action - use oldStatus as the new status value (API quirk)
    if (item.actionType === ACTION_TYPE.STATUS_CHANGE) {
      // The API uses oldStatus to represent the status that was set
      const statusValue = item.oldStatus ?? item.status
      const statusLabel =
        statusValue !== undefined
          ? STATUS_LABELS[statusValue] ?? `Status ${statusValue}`
          : 'Unknown'
      const actionText =
        statusValue === 0 ? 'reset to Created' : `marked as ${statusLabel}`

      return (
        <div
          key={`status-${item.timestamp}-${index}`}
          className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-900/50"
        >
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img
                src={getImageSrc(avatarUrl)}
                alt={userName}
                className="size-5 rounded-full border border-zinc-200 dark:border-zinc-700"
                onError={() => avatarUrl && handleImageError(avatarUrl)}
                loading="lazy"
              />
            ) : (
              <div className="h-2 w-2 rounded-full bg-zinc-400" />
            )}
          </div>
          <span className="text-zinc-600 dark:text-zinc-400">
            {userName} {actionText}
          </span>
          <span className="ml-auto text-zinc-400 dark:text-zinc-500">
            {timestamp.toLocaleDateString()}
          </span>
        </div>
      )
    }

    // Created action
    if (item.actionType === ACTION_TYPE.CREATED) {
      return (
        <div
          key={`created-${item.timestamp}-${index}`}
          className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-900/50"
        >
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-zinc-600 dark:text-zinc-400">Task created</span>
          <span className="ml-auto text-zinc-400 dark:text-zinc-500">
            {timestamp.toLocaleDateString()}
          </span>
        </div>
      )
    }

    // Review status change
    if (item.actionType === ACTION_TYPE.REVIEW_STATUS_CHANGE) {
      return (
        <div
          key={`review-${item.timestamp}-${index}`}
          className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs dark:bg-amber-900/20"
        >
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-amber-700 dark:text-amber-400">{userName} updated review status</span>
          <span className="ml-auto text-zinc-400 dark:text-zinc-500">
            {timestamp.toLocaleDateString()}
          </span>
        </div>
      )
    }

    // Meta review status change
    if (item.actionType === ACTION_TYPE.META_REVIEW_STATUS_CHANGE) {
      return (
        <div
          key={`meta-review-${item.timestamp}-${index}`}
          className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-xs dark:bg-purple-900/20"
        >
          <div className="h-2 w-2 rounded-full bg-purple-400" />
          <span className="text-purple-700 dark:text-purple-400">
            {userName} updated meta review status
          </span>
          <span className="ml-auto text-zinc-400 dark:text-zinc-500">
            {timestamp.toLocaleDateString()}
          </span>
        </div>
      )
    }

    // Unknown action type - skip
    return null
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
            </div>
          ) : sortedHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="mb-2 size-8 text-zinc-400 dark:text-zinc-500" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No activity yet. Be the first to comment!
              </p>
            </div>
          ) : (
            sortedHistory
              .map((item, index) => renderHistoryItem(item, index))
              .filter((item) => item !== null)
          )}
          <div ref={commentsEndRef} />
        </div>
      </ScrollArea>

      {user ? (
        <form
          onSubmit={handleSubmit}
          className="mt-3 border-zinc-200 border-t pt-3 dark:border-zinc-800"
        >
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="flex-1 resize-none text-sm"
              maxLength={5000}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!commentText.trim() || addCommentMutation.isPending}
              className="self-end"
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          Sign in to add comments
        </div>
      )}
    </div>
  )
}
