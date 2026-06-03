import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCheck,
  CheckCircle2,
  Circle,
  HelpCircle,
  type LucideIcon,
  MessageCircleQuestion,
  MessageSquare,
  Send,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { api } from '@/api'
import { useTaskContext } from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Textarea } from '@/components/ui/Textarea'
import { useAuthContext } from '@/contexts/AuthContext'
import { useAvatarContext } from '@/contexts/AvatarContext'
import { formatDate, formatDateTime } from '@/lib/date'
import { logger } from '@/lib/logger'
import { STATUS_LABELS } from '@/lib/taskConstants'
import { cn } from '@/lib/utils'
import type { TaskHistoryAction } from '@/types/Task'

// Action types from the API — must match backend TaskLogEntry constants
const ACTION_TYPE = {
  COMMENT: 0,
  STATUS_CHANGE: 1,
  REVIEW: 2,
  UPDATE: 3,
  META_REVIEW: 4,
} as const

type StatusVisual = {
  icon: LucideIcon
  pill: string
  bar: string
  tint: string
}

const STATUS_VISUALS: Record<number, StatusVisual> = {
  0: {
    icon: Circle,
    pill: 'bg-zinc-200 text-zinc-700 ring-zinc-300/60 dark:bg-zinc-700/60 dark:text-zinc-200 dark:ring-zinc-600/60',
    bar: 'bg-zinc-400 dark:bg-zinc-500',
    tint: 'from-zinc-100/80 dark:from-zinc-800/30',
  },
  1: {
    icon: CheckCircle2,
    pill: 'bg-green-100 text-green-700 ring-green-300/60 dark:bg-green-900/40 dark:text-green-300 dark:ring-green-700/40',
    bar: 'bg-green-500',
    tint: 'from-green-100/70 dark:from-green-950/30',
  },
  2: {
    icon: XCircle,
    pill: 'bg-rose-100 text-rose-700 ring-rose-300/60 dark:bg-rose-900/40 dark:text-rose-300 dark:ring-rose-700/40',
    bar: 'bg-rose-500',
    tint: 'from-rose-100/70 dark:from-rose-950/30',
  },
  3: {
    icon: SkipForward,
    pill: 'bg-yellow-100 text-yellow-700 ring-yellow-300/60 dark:bg-yellow-900/40 dark:text-yellow-300 dark:ring-yellow-700/40',
    bar: 'bg-yellow-500',
    tint: 'from-yellow-100/70 dark:from-yellow-950/30',
  },
  4: {
    icon: Trash2,
    pill: 'bg-red-100 text-red-700 ring-red-300/60 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-700/40',
    bar: 'bg-red-500',
    tint: 'from-red-100/70 dark:from-red-950/30',
  },
  5: {
    icon: CheckCheck,
    pill: 'bg-blue-100 text-blue-700 ring-blue-300/60 dark:bg-blue-900/40 dark:text-blue-300 dark:ring-blue-700/40',
    bar: 'bg-blue-500',
    tint: 'from-blue-100/70 dark:from-blue-950/30',
  },
  6: {
    icon: AlertTriangle,
    pill: 'bg-orange-100 text-orange-700 ring-orange-300/60 dark:bg-orange-900/40 dark:text-orange-300 dark:ring-orange-700/40',
    bar: 'bg-orange-500',
    tint: 'from-orange-100/70 dark:from-orange-950/30',
  },
  7: {
    icon: MessageCircleQuestion,
    pill: 'bg-purple-100 text-purple-700 ring-purple-300/60 dark:bg-purple-900/40 dark:text-purple-300 dark:ring-purple-700/40',
    bar: 'bg-purple-500',
    tint: 'from-purple-100/70 dark:from-purple-950/30',
  },
  8: {
    icon: ShieldCheck,
    pill: 'bg-emerald-100 text-emerald-700 ring-emerald-300/60 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-700/40',
    bar: 'bg-emerald-500',
    tint: 'from-emerald-100/70 dark:from-emerald-950/30',
  },
  9: {
    icon: Ban,
    pill: 'bg-zinc-100 text-zinc-500 ring-zinc-300/60 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700/60',
    bar: 'bg-zinc-400',
    tint: 'from-zinc-100/80 dark:from-zinc-800/30',
  },
}

const DEFAULT_STATUS_VISUAL: StatusVisual = {
  icon: HelpCircle,
  pill: 'bg-zinc-100 text-zinc-700 ring-zinc-300/60 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700/60',
  bar: 'bg-zinc-400',
  tint: 'from-zinc-100/80 dark:from-zinc-800/30',
}

const getStatusVisual = (status: number | undefined): StatusVisual | null => {
  if (status === undefined) return null
  return STATUS_VISUALS[status] ?? DEFAULT_STATUS_VISUAL
}

const StatusPill = ({ status, muted = false }: { status: number; muted?: boolean }) => {
  const visual = STATUS_VISUALS[status] ?? DEFAULT_STATUS_VISUAL
  const Icon = visual.icon
  const label = STATUS_LABELS[status] ?? `Status ${status}`
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium text-[11px] ring-1 ring-inset',
        visual.pill,
        muted && 'opacity-60'
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  )
}

export const CommentsHistoryTab = () => {
  const { task } = useTaskContext()
  const { user } = useAuthContext()
  const [commentText, setCommentText] = useState('')
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { handleImageError, getImageSrc } = useAvatarContext()

  const { data: taskHistory = [], isLoading } = api.task.getTaskHistory(task.id)
  const addCommentMutation = api.task.useAddTaskComment()

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
          logger.error('Error adding comment', { error })
          toast.error('Failed to add comment')
        },
      }
    )
  }

  const userOsmId = user?.osmProfile?.id

  const sortedHistory = useMemo(() => {
    return [...taskHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [taskHistory])

  const renderHistoryItem = (item: TaskHistoryAction, index: number) => {
    const timestamp = new Date(item.timestamp)
    const userName = item.user?.username ?? 'System'

    if (item.actionType === ACTION_TYPE.UPDATE) {
      return null
    }

    if (item.actionType === ACTION_TYPE.COMMENT && item.comment) {
      const commentText = typeof item.comment === 'string' ? item.comment : item.comment.comment
      const commentObj = typeof item.comment === 'object' ? item.comment : null
      const commentUserName = commentObj?.osm_username ?? userName
      const commentAvatarUrl = commentObj?.avatarUrl
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
              className="size-8 rounded-full border border-zinc-200 dark:border-slate-700"
              onError={() => commentAvatarUrl && handleImageError(commentAvatarUrl)}
              loading="lazy"
            />
          </div>

          <div
            className={cn(
              'flex min-w-0 flex-1 flex-col gap-1 rounded-lg p-2.5',
              isUser ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-zinc-100 dark:bg-slate-800'
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

            <div className="text-xs text-zinc-500 dark:text-slate-400">
              {formatDateTime(timestamp)}
            </div>
          </div>
        </div>
      )
    }

    if (item.actionType === ACTION_TYPE.STATUS_CHANGE) {
      const oldVisual = getStatusVisual(item.oldStatus)
      const newVisual = getStatusVisual(item.status) ?? oldVisual ?? DEFAULT_STATUS_VISUAL

      return (
        <div
          key={`status-${item.timestamp}-${index}`}
          title={formatDateTime(timestamp)}
          className={cn(
            'relative flex flex-wrap items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r to-transparent py-2 pr-3 pl-4 text-xs',
            newVisual.tint
          )}
        >
          <div className={cn('absolute top-0 bottom-0 left-0 w-1', newVisual.bar)} />
          <span className="font-medium text-zinc-700 dark:text-slate-200">{userName}</span>
          {item.oldStatus !== undefined && item.status !== undefined ? (
            <>
              <StatusPill status={item.oldStatus} muted />
              <ArrowRight className="size-3 text-zinc-400 dark:text-slate-500" />
              <StatusPill status={item.status} />
            </>
          ) : item.status !== undefined ? (
            <>
              <span className="text-zinc-500 dark:text-slate-400">marked as</span>
              <StatusPill status={item.status} />
            </>
          ) : item.oldStatus !== undefined ? (
            <>
              <span className="text-zinc-500 dark:text-slate-400">cleared</span>
              <StatusPill status={item.oldStatus} muted />
            </>
          ) : (
            <span className="text-zinc-500 dark:text-slate-400">changed status</span>
          )}
          <span className="ml-auto text-zinc-400 dark:text-slate-500">{formatDate(timestamp)}</span>
        </div>
      )
    }

    if (item.actionType === ACTION_TYPE.REVIEW) {
      return (
        <div
          key={`review-${item.timestamp}-${index}`}
          title={formatDateTime(timestamp)}
          className="relative flex flex-wrap items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-amber-100/70 to-transparent py-2 pr-3 pl-4 text-xs dark:from-amber-950/30"
        >
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-amber-500" />
          <ShieldCheck className="size-4 text-amber-600 dark:text-amber-400" />
          <span className="font-medium text-amber-800 dark:text-amber-300">{userName}</span>
          <span className="text-amber-700/80 dark:text-amber-400/80">reviewed task</span>
          <span className="ml-auto text-zinc-400 dark:text-slate-500">{formatDate(timestamp)}</span>
        </div>
      )
    }

    if (item.actionType === ACTION_TYPE.META_REVIEW) {
      return (
        <div
          key={`meta-review-${item.timestamp}-${index}`}
          title={formatDateTime(timestamp)}
          className="relative flex flex-wrap items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-purple-100/70 to-transparent py-2 pr-3 pl-4 text-xs dark:from-purple-950/30"
        >
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-purple-500" />
          <Sparkles className="size-4 text-purple-600 dark:text-purple-400" />
          <span className="font-medium text-purple-800 dark:text-purple-300">{userName}</span>
          <span className="text-purple-700/80 dark:text-purple-400/80">meta-reviewed task</span>
          <span className="ml-auto text-zinc-400 dark:text-slate-500">{formatDate(timestamp)}</span>
        </div>
      )
    }

    return null
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
            </div>
          ) : sortedHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <MessageSquare className="mb-2 size-8 text-zinc-400 dark:text-slate-500" />
              <p className="text-sm text-zinc-500 dark:text-slate-400">
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
          className="mt-3 border-zinc-200 border-t pt-3 dark:border-slate-700"
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
        <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center text-xs text-zinc-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Sign in to add comments
        </div>
      )}
    </div>
  )
}
