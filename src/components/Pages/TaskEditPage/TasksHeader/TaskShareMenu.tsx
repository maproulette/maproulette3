import { Copy, ExternalLink, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import type { Task } from '@/types/Task'

interface TaskShareMenuProps {
  task: Task
}

export const TaskShareMenu = ({ task }: TaskShareMenuProps) => {
  const handleCopyLink = () => {
    const taskUrl = `${window.location.origin}/tasks/${task.id}`
    navigator.clipboard.writeText(taskUrl)
    toast.success('Task link copied to clipboard')
  }

  const handleShare = async () => {
    const taskUrl = `${window.location.origin}/tasks/${task.id}`
    const shareData = {
      title: `Task ${task.id}: ${task.name}`,
      text: `Check out this MapRoulette task: ${task.name}`,
      url: taskUrl,
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        toast.success('Task shared successfully')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopyLink()
        }
      }
    } else {
      handleCopyLink()
    }
  }

  const handleOpenInNewTab = () => {
    const taskUrl = `${window.location.origin}/tasks/${task.id}`
    window.open(taskUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Share task"
          className="h-9 w-9 hover:bg-zinc-100 dark:hover:bg-slate-800"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Task
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOpenInNewTab} className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Open in New Tab
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
