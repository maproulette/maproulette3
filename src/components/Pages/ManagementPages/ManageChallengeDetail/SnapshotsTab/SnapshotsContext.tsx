import { createContext, type ReactNode, useContext, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import type { ChallengeSnapshot } from '@/api/admin/snapshots'
import { useAuthContext } from '@/contexts/AuthContext'
import { canManageChallenge } from '@/lib/challengePermissions'
import { logger } from '@/lib/logger'
import type { ChallengeGetResponse } from '@/types/Challenge'

type SnapshotsContextValue = {
  challengeId: number
  challenge: ChallengeGetResponse | undefined
  snapshots: ChallengeSnapshot[]
  isLoading: boolean
  isError: boolean
  canManage: boolean
  createSnapshot: () => Promise<void>
  deleteSnapshot: (snapshotId: number) => Promise<void>
  exportCsv: () => Promise<void>
  isCreating: boolean
  isDeleting: boolean
  isExporting: boolean
  createDialogOpen: boolean
  setCreateDialogOpen: (open: boolean) => void
  importDialogOpen: boolean
  setImportDialogOpen: (open: boolean) => void
  deleteTargetId: number | null
  setDeleteTargetId: (id: number | null) => void
}

const SnapshotsContext = createContext<SnapshotsContextValue | null>(null)

export const useSnapshotsContext = () => {
  const ctx = useContext(SnapshotsContext)
  if (!ctx) {
    throw new Error('useSnapshotsContext must be used within a SnapshotsProvider')
  }
  return ctx
}

export const SnapshotsProvider = ({
  challengeId,
  children,
}: {
  challengeId: number
  children: ReactNode
}) => {
  const { user } = useAuthContext()
  const { data: challenge } = api.challenge.getChallenge(challengeId)

  const { data: snapshots, isLoading, isError } = api.admin.listSnapshotsDetailed(challengeId)

  const createMutation = api.admin.useCreateSnapshot()
  const deleteMutation = api.admin.useDeleteSnapshot()

  const [isExporting, setIsExporting] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const canManage = canManageChallenge(user ?? null, challenge)

  const createSnapshot = async () => {
    try {
      await createMutation.mutateAsync(challengeId)
      toast.success('Snapshot recorded')
      setCreateDialogOpen(false)
    } catch (error) {
      logger.error('Create snapshot failed', { error, challengeId })
      toast.error('Could not record snapshot')
      throw error
    }
  }

  const deleteSnapshot = async (snapshotId: number) => {
    try {
      await deleteMutation.mutateAsync(snapshotId)
      toast.success('Snapshot deleted')
      setDeleteTargetId(null)
    } catch (error) {
      logger.error('Delete snapshot failed', { error, snapshotId })
      toast.error('Could not delete snapshot')
      throw error
    }
  }

  const exportCsv = async () => {
    setIsExporting(true)
    try {
      const blob = await api.admin.exportSnapshotsCsv(challengeId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `challenge_${challengeId}_snapshots.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Snapshot CSV downloaded')
    } catch (error) {
      logger.error('Export snapshots failed', { error, challengeId })
      toast.error('Could not export snapshots')
      throw error
    } finally {
      setIsExporting(false)
    }
  }

  const value = useMemo(
    (): SnapshotsContextValue => ({
      challengeId,
      challenge: challenge ?? undefined,
      snapshots: snapshots ?? [],
      isLoading,
      isError,
      canManage,
      createSnapshot,
      deleteSnapshot,
      exportCsv,
      isCreating: createMutation.isPending,
      isDeleting: deleteMutation.isPending,
      isExporting,
      createDialogOpen,
      setCreateDialogOpen,
      importDialogOpen,
      setImportDialogOpen,
      deleteTargetId,
      setDeleteTargetId,
    }),
    [
      challengeId,
      challenge,
      snapshots,
      isLoading,
      isError,
      canManage,
      createMutation.isPending,
      deleteMutation.isPending,
      isExporting,
      createDialogOpen,
      importDialogOpen,
      deleteTargetId,
    ]
  )

  return <SnapshotsContext.Provider value={value}>{children}</SnapshotsContext.Provider>
}
