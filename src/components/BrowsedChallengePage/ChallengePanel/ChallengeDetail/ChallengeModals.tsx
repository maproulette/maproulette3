import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { ChallengeComments } from '../ChallengeComments'
import { CloneChallengeModal } from '../CloneChallengeModal'
import { ReportModal } from '../ReportModal'

interface ChallengeModalsProps {
  user: unknown
  challenge: {
    id?: number
    name?: string
    owner?: unknown
    overpassQL?: string | null
    [key: string]: unknown
  }
  projectId?: number | null
  existingIssue: { html_url: string } | null
  isReportModalOpen: boolean
  isCommentsModalOpen: boolean
  isOverpassModalOpen: boolean
  isCloneModalOpen: boolean
  canClone?: boolean
  hasOverpass?: boolean
  onReportModalChange: (open: boolean) => void
  onCommentsModalChange: (open: boolean) => void
  onOverpassModalChange: (open: boolean) => void
  onCloneModalChange: (open: boolean) => void
  onReportSuccess: () => void
}

export const ChallengeModals = ({
  user,
  challenge,
  projectId,
  existingIssue,
  isReportModalOpen,
  isCommentsModalOpen,
  isOverpassModalOpen,
  isCloneModalOpen,
  canClone,
  hasOverpass,
  onReportModalChange,
  onCommentsModalChange,
  onOverpassModalChange,
  onCloneModalChange,
  onReportSuccess,
}: ChallengeModalsProps) => {
  const ownerId =
    typeof challenge.owner === 'object' && challenge.owner !== null
      ? (challenge.owner as { id?: number; osmProfile?: { id?: number } })?.id ||
        (challenge.owner as { osmProfile?: { id?: number } })?.osmProfile?.id
      : typeof challenge.owner === 'number'
        ? challenge.owner
        : undefined

  return (
    <>
      {user && (
        <ReportModal
          open={isReportModalOpen}
          onOpenChange={onReportModalChange}
          challenge={challenge}
          onSuccess={onReportSuccess}
        />
      )}

      {user && (
        <Dialog open={isCommentsModalOpen} onOpenChange={onCommentsModalChange}>
          <DialogContent className="flex h-[80vh] max-w-2xl flex-col">
            <DialogHeader>
              <DialogTitle>Challenge Comments</DialogTitle>
            </DialogHeader>
            <div className="flex min-h-0 flex-1 flex-col">
              <ChallengeComments challengeId={challenge.id!} ownerId={ownerId} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {hasOverpass && (
        <Dialog open={isOverpassModalOpen} onOpenChange={onOverpassModalChange}>
          <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col">
            <DialogHeader>
              <DialogTitle>Overpass Query</DialogTitle>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <textarea
                    readOnly
                    value={challenge.overpassQL || ''}
                    className="h-full w-full resize-none rounded-lg border-0 bg-transparent p-4 font-mono text-sm text-zinc-900 focus:outline-none dark:text-zinc-50"
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {canClone && (
        <CloneChallengeModal
          open={isCloneModalOpen}
          onOpenChange={onCloneModalChange}
          challengeId={challenge.id}
          challengeName={challenge.name}
          currentProjectId={projectId}
        />
      )}
    </>
  )
}
