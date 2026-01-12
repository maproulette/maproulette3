import { Copy, ExternalLink, Share2, Star } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { BundleToggle } from '../BundleToggle'

export const TasksHeader = () => {
  const { task } = useTaskContext()
  const [isFavorited, setIsFavorited] = useState(false)

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

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited)
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites')
  }

  const getStatusBadge = () => {
    const statusLabels: Record<number, { label: string; color: string }> = {
      0: {
        label: 'Created',
        color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
      },
      1: {
        label: 'Fixed',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
      },
      2: {
        label: 'False Positive',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
      },
      3: {
        label: 'Skipped',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
      },
      4: {
        label: 'Deleted',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
      },
      5: {
        label: 'Too Hard',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
      },
      6: {
        label: 'Already Fixed',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
      },
    }

    const status = task.status ?? 0
    const statusInfo = statusLabels[status] || statusLabels[0]

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold text-xs shadow-sm ${statusInfo.color}`}
      >
        {statusInfo.label}
      </span>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5">
            <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Task #{task.id}
            </span>
            {getStatusBadge()}
          </div>
          {task.name && (
            <span className="max-w-md truncate font-medium text-sm text-zinc-600 dark:text-zinc-400">
              {task.name}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-1.5">
        <BundleToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              title="Share task"
              className="h-9 w-9 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFavorite}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          className={`h-9 w-9 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
            isFavorited ? 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400' : ''
          }`}
        >
          <Star className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
        </Button>
      </div>
    </div>
  )
}
