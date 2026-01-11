import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Copy, Loader2 } from 'lucide-react'
import { useId, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { ScrollArea } from '@/components/ui/ScrollArea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

interface CloneChallengeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  challengeId: number
  challengeName: string
  currentProjectId?: number
}

export const CloneChallengeModal = ({
  open,
  onOpenChange,
  challengeId,
  challengeName,
  currentProjectId,
}: CloneChallengeModalProps) => {
  const navigate = useNavigate()
  const nameId = useId()
  const projectId = useId()
  const [newName, setNewName] = useState(`${challengeName} (Copy)`)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  const { data: managedProjects = [], isLoading: isLoadingProjects } = useQuery(
    api.project.getManagedProjects({
      limit: 100,
      page: 0,
      onlyEnabled: false,
      onlyOwned: false,
      searchString: '',
    })
  )

  const availableProjects = managedProjects.filter((p) => p.id !== currentProjectId)

  const cloneMutation = useMutation({
    mutationFn: async () => {
      if (!newName.trim()) {
        throw new Error('Challenge name is required')
      }
      if (!selectedProjectId) {
        throw new Error('Please select a project')
      }
      return api.challenge.cloneChallenge(challengeId, newName.trim())
    },
    onSuccess: async (clonedChallenge) => {
      toast.success('Challenge cloned successfully')
      onOpenChange(false)

      if (clonedChallenge.id) {
        await navigate({
          to: '/manage/challenge/$challengeId',
          params: { challengeId: String(clonedChallenge.id) },
        })
      }
    },
    onError: (error: Error) => {
      console.error('Error cloning challenge:', error)
      toast.error(error.message || 'Failed to clone challenge')
    },
  })

  const handleClone = () => {
    if (!newName.trim()) {
      toast.error('Please enter a name for the cloned challenge')
      return
    }
    if (!selectedProjectId) {
      toast.error('Please select a project')
      return
    }
    cloneMutation.mutate()
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewName(`${challengeName} (Copy)`)
      setSelectedProjectId('')
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="size-5" />
            Clone Challenge
          </DialogTitle>
          <DialogDescription>
            Create a copy of this challenge in a different project. The cloned challenge will
            include all settings but will start with no tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Challenge Name Input */}
          <div className="space-y-2">
            <Label htmlFor={nameId}>New Challenge Name</Label>
            <Input
              id={nameId}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter name for cloned challenge"
              maxLength={255}
            />
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor={projectId}>Select Project</Label>
            {isLoadingProjects ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-zinc-400" />
              </div>
            ) : availableProjects.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                No projects available. You need to be a manager of at least one project to clone
                challenges.
              </div>
            ) : (
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger id={projectId} className="w-full">
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="max-h-60">
                    {availableProjects.map((project) => (
                      <SelectItem key={project.id} value={String(project.id)}>
                        {project.displayName || project.name}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={cloneMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClone}
            disabled={
              !newName.trim() || !selectedProjectId || cloneMutation.isPending || isLoadingProjects
            }
          >
            {cloneMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Cloning...
              </>
            ) : (
              <>
                <Copy className="mr-2 size-4" />
                Clone Challenge
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
