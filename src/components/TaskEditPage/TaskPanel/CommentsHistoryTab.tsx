import { MessageSquare, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Textarea } from '@/components/ui/Textarea'
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { useTaskContext } from '../contexts/TaskContext'

const STATUS_LABELS: Record<number, string> = {
  0: 'Created',
  1: 'Fixed',
  2: 'False Positive',
  3: 'Skipped',
  4: 'Deleted',
  5: 'Already Fixed',
  6: 'Too Hard',
}

interface TaskComment {
  id: number
  osm_id: number
  osm_username: string
  avatarUrl?: string
  taskId: number
  challengeId: number
  projectId: number
  created: number
  comment: string
  actionId?: number
}

export const CommentsHistoryTab = () => {
  const { user } = useAuthContext()
  const { task } = useTaskContext()
  const [commentText, setCommentText] = useState('')
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: taskComments = [], isLoading } = api.task.getTaskComments(task.id)
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
          setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        },
        onError: (error) => {
          console.error('Error adding comment:', error)
          toast.error('Failed to add comment')
        },
      }
    )
  }

  useEffect(() => {
    if (taskComments.length > 0) {
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [taskComments.length])

  const sortedComments = [...(taskComments as TaskComment[])].sort((a, b) => a.created - b.created)
  const userOsmId = user?.osmProfile?.id

  // Create activity items combining comments and status history
  const activityItems: Array<{
    type: 'comment' | 'status'
    timestamp: number
    data: TaskComment | { status: number; user?: string }
  }> = sortedComments.map((comment) => ({
    type: 'comment' as const,
    timestamp: comment.created,
    data: comment,
  }))

  // Add task creation as first activity
  if (task.created) {
    activityItems.unshift({
      type: 'status',
      timestamp: task.created,
      data: { status: 0, user: 'System' },
    })
  }

  // Add completion event if task was completed
  if (task.mappedOn && task.status !== 0) {
    activityItems.push({
      type: 'status',
      timestamp: task.mappedOn,
      data: { status: task.status ?? 0 },
    })
  }

  // Sort all activities by timestamp
  activityItems.sort((a, b) => a.timestamp - b.timestamp)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
            </div>
          ) : activityItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="mb-2 size-8 text-zinc-400 dark:text-zinc-500" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No activity yet. Be the first to comment!
              </p>
            </div>
          ) : (
            activityItems.map((item, index) => {
              if (item.type === 'status') {
                const statusData = item.data as { status: number; user?: string }
                return (
                  <div
                    key={`status-${index}`}
                    className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-900/50"
                  >
                    <div className="h-2 w-2 rounded-full bg-zinc-400" />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Task {statusData.status === 0 ? 'created' : `marked as ${STATUS_LABELS[statusData.status]}`}
                    </span>
                    <span className="ml-auto text-zinc-400 dark:text-zinc-500">
                      {new Date(item.timestamp * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )
              }

              const comment = item.data as TaskComment
              const isUser = comment.osm_id === userOsmId

              return (
                <div
                  key={`comment-${comment.id}`}
                  className={cn('flex min-w-0 gap-2', isUser && 'flex-row-reverse')}
                >
                  <div className="flex-shrink-0">
                    <img
                      src={getImageSrc(comment.avatarUrl)}
                      alt={comment.osm_username}
                      className="size-8 rounded-full border border-zinc-200 dark:border-zinc-700"
                      onError={() => comment.avatarUrl && handleImageError(comment.avatarUrl)}
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
                        href={`https://www.openstreetmap.org/user/${encodeURIComponent(comment.osm_username)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 text-xs hover:underline dark:text-blue-400"
                      >
                        {comment.osm_username}
                      </a>
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-w-none break-words text-xs [&_*]:break-words [&_a]:text-blue-600 [&_a]:hover:underline dark:[&_a]:text-blue-400">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline dark:text-blue-400"
                            />
                          ),
                        }}
                      >
                        {comment.comment}
                      </ReactMarkdown>
                    </div>

                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {new Date(comment.created * 1000).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={commentsEndRef} />
        </div>
      </ScrollArea>

      {user ? (
        <form onSubmit={handleSubmit} className="mt-3 border-zinc-200 border-t pt-3 dark:border-zinc-800">
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
