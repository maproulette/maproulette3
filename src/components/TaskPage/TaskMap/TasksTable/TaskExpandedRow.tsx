import { TableCell, TableRow } from '@/components/ui/Table'
import type { Comment as TaskComment } from '@/types/Comment'
import { TaskComments } from './TaskComments'
import { TaskData } from './TaskData'

interface TaskExpandedRowProps {
  taskData: unknown
  isLoadingTaskData: boolean
  comments: TaskComment[]
  isLoadingComments: boolean
  onAddComment: (text: string) => void
  isAddingComment: boolean
}

export const TaskExpandedRow = ({
  taskData,
  isLoadingTaskData,
  comments,
  isLoadingComments,
  onAddComment,
  isAddingComment,
}: TaskExpandedRowProps) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="bg-zinc-50 px-4 py-4 dark:bg-zinc-900/50">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Task Data Column */}
          <TaskData taskData={taskData} isLoading={isLoadingTaskData} />

          {/* Comments Column */}
          <TaskComments
            comments={comments}
            isLoading={isLoadingComments}
            onAddComment={onAddComment}
            isAddingComment={isAddingComment}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
