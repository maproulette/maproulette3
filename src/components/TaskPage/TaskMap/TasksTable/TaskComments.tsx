import { Send, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { Comment as TaskComment } from '@/types/Comment'

interface TaskCommentsProps {
  comments: TaskComment[]
  isLoading: boolean
  onAddComment: (text: string) => void
  isAddingComment: boolean
}

export const TaskComments = ({
  comments,
  isLoading,
  onAddComment,
  isAddingComment,
}: TaskCommentsProps) => {
  const [commentText, setCommentText] = useState('')

  const handleSubmit = () => {
    if (commentText.trim()) {
      onAddComment(commentText)
      setCommentText('')
    }
  }

  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
        <MessageSquare className="h-4 w-4" />
        Comments
      </h4>

      {/* Comments List */}
      <div className="max-h-64 space-y-2 overflow-auto">
        {isLoading ? (
          <div className="text-sm text-zinc-500">Loading comments...</div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                  {comment.osm_username || 'Unknown User'}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {comment.created ? new Date(comment.created).toLocaleString() : ''}
                </span>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{comment.comment}</p>
            </div>
          ))
        ) : (
          <div className="text-sm text-zinc-500">No comments yet</div>
        )}
      </div>

      {/* Add Comment */}
      <div className="flex gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit()
            }
          }}
          placeholder="Add a comment..."
          className="flex-1 rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
        />
        <Button
          onClick={handleSubmit}
          disabled={!commentText.trim() || isAddingComment}
          size="icon"
          className="h-10 w-10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

