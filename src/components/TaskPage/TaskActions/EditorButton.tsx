import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Lock, Unlock } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useAuthContext } from '@/contexts/AuthContext'
import { editorOptions } from '@/data/account.json'
import type { Task } from '@/types/Task'

interface EditorButtonProps {
  task: Task
}

export const EditorButton = ({ task }: EditorButtonProps) => {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockedBy, setLockedBy] = useState<number | null>(null)

  // Get current default editor (default to iD if not set)
  const defaultEditor = user?.settings?.defaultEditor ?? 0
  const currentEditorOption =
    editorOptions.find((opt) => opt.value === defaultEditor) || editorOptions[1] // Default to iD

  // Check if task is locked by current user
  const isLockedByCurrentUser = isLocked && lockedBy === user?.id

  const updateEditorMutation = useMutation({
    mutationFn: async (editorValue: number) => {
      if (!user?.id) throw new Error('User not found')
      return api.user.updateUserSettings(user.id, {
        ...user.settings,
        defaultEditor: editorValue,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whoami'] })
      toast.success('Default editor updated')
    },
    onError: () => {
      toast.error('Failed to update default editor')
    },
  })

  const lockTaskMutation = useMutation({
    mutationFn: async () => {
      return api.task.lockTask(task.id)
    },
    onSuccess: () => {
      // Update local state based on response
      setIsLocked(true)
      setLockedBy(user?.id ?? null)
      queryClient.invalidateQueries({ queryKey: ['task', task.id] })
      toast.success('Task locked')
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to lock task'
      if (error && typeof error === 'object') {
        if (
          'data' in error &&
          error.data &&
          typeof error.data === 'object' &&
          'message' in error.data &&
          typeof error.data.message === 'string'
        ) {
          errorMessage = error.data.message
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        }
      }
      toast.error(errorMessage)
    },
  })

  const unlockTaskMutation = useMutation({
    mutationFn: async () => {
      return api.task.unlockTask(task.id)
    },
    onSuccess: () => {
      // Update local state
      setIsLocked(false)
      setLockedBy(null)
      queryClient.invalidateQueries({ queryKey: ['task', task.id] })
      toast.success('Task unlocked')
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to unlock task'
      if (error && typeof error === 'object') {
        if (
          'data' in error &&
          error.data &&
          typeof error.data === 'object' &&
          'message' in error.data &&
          typeof error.data.message === 'string'
        ) {
          errorMessage = error.data.message
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        }
      }
      toast.error(errorMessage)
    },
  })

  const openEditor = (editorValue: number) => {
    if (!task.location) {
      toast.error('Task location not available')
      return
    }

    try {
      const location = typeof task.location === 'string' ? JSON.parse(task.location) : task.location
      const [lng, lat] = location.coordinates || [0, 0]
      const zoom = 18

      let editorUrl = ''

      switch (editorValue) {
        case 0: // iD
          editorUrl = `https://www.openstreetmap.org/edit?editor=id#map=${zoom}/${lat}/${lng}`
          break
        case 1: // JOSM
          // JOSM remote control URL
          editorUrl = `http://localhost:8111/load_and_zoom?left=${lng - 0.001}&right=${lng + 0.001}&top=${lat + 0.001}&bottom=${lat - 0.001}`
          toast.info('Make sure JOSM is running with remote control enabled')
          break
        case 2: // JOSM new layer
          editorUrl = `http://localhost:8111/load_and_zoom?new_layer=true&left=${lng - 0.001}&right=${lng + 0.001}&top=${lat + 0.001}&bottom=${lat - 0.001}`
          toast.info('Make sure JOSM is running with remote control enabled')
          break
        case 3: // level0
          editorUrl = `https://level0.osmz.ru/?center=${lat},${lng}&zoom=${zoom}`
          break
        case 4: // JOSM features only
          editorUrl = `http://localhost:8111/import?url=${encodeURIComponent(
            `https://www.openstreetmap.org/api/0.6/[way,relation](${lat},${lng},${lat},${lng})`
          )}`
          toast.info('Make sure JOSM is running with remote control enabled')
          break
        case 5: {
          // Rapid
          // Rapid editor uses a local route
          const rapidUrl = `/rapid-editor.html#map=${zoom}/${lat}/${lng}`
          window.open(rapidUrl, '_blank', 'noopener,noreferrer')
          toast.success('Opening task in Rapid editor')
          return
        }
        default:
          editorUrl = `https://www.openstreetmap.org/edit?editor=id#map=${zoom}/${lat}/${lng}`
      }

      if (editorUrl) {
        window.open(editorUrl, '_blank', 'noopener,noreferrer')
        toast.success(
          `Opening task in ${editorOptions.find((opt) => opt.value === editorValue)?.label || 'editor'}`
        )
      }
    } catch (error) {
      console.error('Error opening editor:', error)
      toast.error('Failed to open editor')
    }
  }

  const handleOpenEditor = () => {
    openEditor(defaultEditor === -1 ? 0 : defaultEditor)
  }

  const handleSetDefaultEditor = async (editorValue: number) => {
    if (editorValue === defaultEditor) {
      // Already the default, no need to update
      return
    }

    setIsSaving(true)
    try {
      await updateEditorMutation.mutateAsync(editorValue)
    } catch (error) {
      console.error('Error setting default editor:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLockTask = async () => {
    try {
      await lockTaskMutation.mutateAsync()
    } catch (error) {
      console.error('Error locking task:', error)
    }
  }

  const handleUnlockTask = async () => {
    try {
      await unlockTaskMutation.mutateAsync()
    } catch (error) {
      console.error('Error unlocking task:', error)
    }
  }

  // Get short label for mobile
  const getShortLabel = (label: string) => {
    if (label.includes('iD')) return 'iD'
    if (label.includes('JOSM')) {
      if (label.includes('new layer')) return 'JOSM Layer'
      if (label.includes('features')) return 'JOSM Features'
      return 'JOSM'
    }
    if (label.includes('level0')) return 'Level0'
    if (label.includes('Rapid')) return 'Rapid'
    return label
  }

  return (
    <div className="flex items-center gap-2">
      {/* Lock/Unlock Button */}
      {isLockedByCurrentUser ? (
        <Button
          size="sm"
          variant="outline"
          onClick={handleUnlockTask}
          disabled={unlockTaskMutation.isPending}
          className="gap-2"
          title="Unlock task"
        >
          <Unlock className="h-4 w-4" />
          <span className="hidden sm:inline">Unlock</span>
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={handleLockTask}
          disabled={lockTaskMutation.isPending || isLocked}
          className="gap-2"
          title={isLocked ? 'Task is locked by another user' : 'Lock task'}
        >
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">Lock</span>
        </Button>
      )}

      {/* Editor Button */}
      <div className="flex items-center">
        <Button
          size="sm"
          onClick={handleOpenEditor}
          className="gap-2 rounded-r-none border-r border-r-background/20"
          variant="default"
          title={`Open task in ${currentEditorOption.label}`}
          disabled={isSaving || updateEditorMutation.isPending}
        >
          <span className="hidden sm:inline">{currentEditorOption.label}</span>
          <span className="sm:hidden">{getShortLabel(currentEditorOption.label)}</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="default"
              className="rounded-l-none px-2"
              title="Change default editor"
              disabled={isSaving || updateEditorMutation.isPending}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Set Default Editor:</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {editorOptions
              .filter((opt) => opt.value !== -1) // Exclude "None" option
              .map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSetDefaultEditor(option.value)}
                  className={option.value === defaultEditor ? 'bg-muted font-medium' : ''}
                  disabled={isSaving || updateEditorMutation.isPending}
                >
                  <span className="mr-2">{option.value === defaultEditor ? '✓' : ' '}</span>
                  {option.label}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
