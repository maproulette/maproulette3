import { SkipForward } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { Task } from '@/types/Task'
import { TaskActionModal } from '../TaskActionModal'

export const SkipButton = ({ task }: { task: Task }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="gap-1.5 rounded-full border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
        title="Skip this task"
      >
        <SkipForward className="h-3.5 w-3.5" />
        Skip this task
      </Button>
      <TaskActionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        task={task}
        initialStatus={3}
      />
    </>
  )
}
