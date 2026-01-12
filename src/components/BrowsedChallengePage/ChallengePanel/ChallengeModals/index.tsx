import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'
import { useAuthContext } from '@/contexts/AuthContext'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { ChallengeComments } from './ChallengeComments'
import { CloneChallengeModal } from './CloneChallengeModal'
import { ReportModal } from './ReportModal'

export interface ChallengeModalsProps {
  isReportModalOpen: boolean
  isCommentsModalOpen: boolean
  isOverpassModalOpen: boolean
  isCloneModalOpen: boolean
  isActionsModalOpen?: boolean
  onReportModalChange: (open: boolean) => void
  onCommentsModalChange: (open: boolean) => void
  onOverpassModalChange: (open: boolean) => void
  onCloneModalChange: (open: boolean) => void
  onActionsModalChange?: (open: boolean) => void
  onReportSuccess: () => void
  actions?: {
    total?: number
    available?: number
    fixed?: number
    falsePositive?: number
    skipped?: number
    deleted?: number
    alreadyFixed?: number
    tooHard?: number
    answered?: number
    validated?: number
    disabled?: number
    avgTimeSpent?: number
    tasksWithTime?: number
  }
}

export const ChallengeModals = ({
  isReportModalOpen,
  isCommentsModalOpen,
  isOverpassModalOpen,
  isCloneModalOpen,
  isActionsModalOpen,
  onReportModalChange,
  onCommentsModalChange,
  onOverpassModalChange,
  onCloneModalChange,
  onActionsModalChange,
  onReportSuccess,
  actions,
}: ChallengeModalsProps) => {
  const { user } = useAuthContext()
  const { challenge, hasOverpass, canClone, projectId } = useBrowsedChallengeContext()

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

      {user && challenge.id && (
        <Dialog open={isCommentsModalOpen} onOpenChange={onCommentsModalChange}>
          <DialogContent className="flex h-[80vh] max-w-2xl flex-col">
            <DialogHeader>
              <DialogTitle>Challenge Comments</DialogTitle>
            </DialogHeader>
            <div className="flex min-h-0 flex-1 flex-col">
              <ChallengeComments challengeId={challenge.id} ownerId={challenge.owner} />
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

      {canClone && challenge.id && challenge.name && (
        <CloneChallengeModal
          open={isCloneModalOpen}
          onOpenChange={onCloneModalChange}
          challengeId={challenge.id}
          challengeName={challenge.name}
          currentProjectId={projectId ?? undefined}
        />
      )}

      {actions && onActionsModalChange && (
        <Dialog open={isActionsModalOpen} onOpenChange={onActionsModalChange}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Task Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-md bg-zinc-50/50 px-3 py-2.5 dark:bg-zinc-900/50">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Fixed</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {actions.fixed || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-zinc-50/50 px-3 py-2.5 dark:bg-zinc-900/50">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">False Positive</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {actions.falsePositive || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-zinc-50/50 px-3 py-2.5 dark:bg-zinc-900/50">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Skipped</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {actions.skipped || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-zinc-50/50 px-3 py-2.5 dark:bg-zinc-900/50">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Available</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {actions.available || 0}
                  </span>
                </div>
                {actions.deleted !== undefined && actions.deleted > 0 && (
                  <div className="flex items-center justify-between rounded-md bg-zinc-50/50 px-3 py-2.5 dark:bg-zinc-900/50">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Deleted</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {actions.deleted || 0}
                    </span>
                  </div>
                )}
                {actions.alreadyFixed !== undefined && actions.alreadyFixed > 0 && (
                  <div className="flex items-center justify-between rounded-md bg-zinc-50/50 px-3 py-2.5 dark:bg-zinc-900/50">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Already Fixed</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {actions.alreadyFixed || 0}
                    </span>
                  </div>
                )}
                {actions.tooHard !== undefined && actions.tooHard > 0 && (
                  <div className="flex items-center justify-between rounded-md bg-zinc-50/50 px-3 py-2.5 dark:bg-zinc-900/50">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Too Hard</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {actions.tooHard || 0}
                    </span>
                  </div>
                )}
                {actions.validated !== undefined && actions.validated > 0 && (
                  <div className="flex items-center justify-between rounded-md bg-zinc-50/50 px-3 py-2.5 dark:bg-zinc-900/50">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Validated</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {actions.validated || 0}
                    </span>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">Total</span>
                <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
                  {actions.total || 0}
                </span>
              </div>
              {actions.avgTimeSpent !== undefined && actions.avgTimeSpent > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Average Time Spent
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {Math.round(actions.avgTimeSpent)}s
                    </span>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
