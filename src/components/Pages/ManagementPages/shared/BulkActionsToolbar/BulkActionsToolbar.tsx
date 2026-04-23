import { Archive, ArchiveRestore, ChevronDown, Tag, Trash2, UserCog, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { logger } from '@/lib/logger'
import { BulkDeleteDialog } from './BulkDeleteDialog'
import { BulkReassignDialog } from './BulkReassignDialog'
import { BulkStatusDialog } from './BulkStatusDialog'
import { BulkTagDialog } from './BulkTagDialog'

interface Props {
  selectedIds: number[]
  onClearSelection: () => void
}

export const BulkActionsToolbar = ({ selectedIds, onClearSelection }: Props) => {
  const [statusOpen, setStatusOpen] = useState(false)
  const [tagOpen, setTagOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [reassignOpen, setReassignOpen] = useState(false)
  const bulkStatus = api.task.useBulkUpdateStatus()
  const bulkTags = api.task.useBulkAddTags()
  const bulkDelete = api.task.useBulkDelete()
  const bulkArchive = api.task.useBulkArchive()
  const bulkReassign = api.task.useBulkReassign()

  if (selectedIds.length === 0) return null

  const handleStatus = async (status: number) => {
    try {
      await bulkStatus.mutateAsync({ taskIds: selectedIds, status })
      toast.success(`Updated ${selectedIds.length} tasks`)
      onClearSelection()
    } catch (error) {
      logger.error('Bulk status failed', { error })
      toast.error('Could not update tasks')
    }
  }

  const handleTags = async (tags: string[]) => {
    try {
      await bulkTags.mutateAsync({ taskIds: selectedIds, tags })
      toast.success(`Tagged ${selectedIds.length} tasks`)
      onClearSelection()
    } catch (error) {
      logger.error('Bulk tag failed', { error })
      toast.error('Could not tag tasks')
    }
  }

  const handleDelete = async () => {
    try {
      const result = await bulkDelete.mutateAsync(selectedIds)
      if (result.denied.length > 0) {
        toast.warning(
          `Deleted ${result.deleted} tasks; ${result.denied.length} could not be deleted`
        )
      } else {
        toast.success(`Deleted ${result.deleted} tasks`)
      }
      setDeleteOpen(false)
      onClearSelection()
    } catch (error) {
      logger.error('Bulk delete failed', { error })
      toast.error('Could not delete tasks')
    }
  }

  const handleArchive = async (archived: boolean) => {
    try {
      await bulkArchive.mutateAsync({ taskIds: selectedIds, archived })
      toast.success(`${archived ? 'Archived' : 'Unarchived'} ${selectedIds.length} tasks`)
      onClearSelection()
    } catch (error) {
      logger.error('Bulk archive failed', { error })
      toast.error('Could not archive tasks')
    }
  }

  const handleReassign = async (userId: number) => {
    try {
      const result = await bulkReassign.mutateAsync({ taskIds: selectedIds, userId })
      toast.success(`Reassigned ${result.updated} of ${result.requested} tasks`)
      setReassignOpen(false)
      onClearSelection()
    } catch (error) {
      logger.error('Bulk reassign failed', { error })
      toast.error('Could not reassign tasks')
    }
  }

  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <span className="font-medium text-sm">{selectedIds.length} selected</span>
      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Change status <ChevronDown className="size-3.5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusOpen(true)}>Pick a status…</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" onClick={() => setTagOpen(true)}>
          <Tag className="size-3.5" aria-hidden="true" /> Tag
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Archive className="size-3.5" aria-hidden="true" /> Archive{' '}
              <ChevronDown className="size-3.5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleArchive(true)}>
              <Archive className="size-3.5" aria-hidden="true" /> Archive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleArchive(false)}>
              <ArchiveRestore className="size-3.5" aria-hidden="true" /> Unarchive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" onClick={() => setReassignOpen(true)}>
          <UserCog className="size-3.5" aria-hidden="true" /> Reassign
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="size-3.5" aria-hidden="true" /> Delete
        </Button>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X className="size-3.5" aria-hidden="true" /> Clear
        </Button>
      </div>
      <BulkStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        onConfirm={(status) => {
          setStatusOpen(false)
          handleStatus(status)
        }}
      />
      <BulkTagDialog
        open={tagOpen}
        onOpenChange={setTagOpen}
        onConfirm={(tags) => {
          setTagOpen(false)
          handleTags(tags)
        }}
      />
      <BulkDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        count={selectedIds.length}
        busy={bulkDelete.isPending}
      />
      <BulkReassignDialog
        open={reassignOpen}
        onOpenChange={setReassignOpen}
        onConfirm={handleReassign}
        count={selectedIds.length}
        busy={bulkReassign.isPending}
      />
    </div>
  )
}
