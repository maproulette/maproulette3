import { api } from '@/api'
import { useBrowsedChallengeContext } from '@/components/BrowsedChallengePage/contexts/BrowsedChallengeContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Separator } from '@/components/ui/Separator'
import { useChallengeModals } from './ChallengeModalsContext'

export const ActionsModal = () => {
  const { challenge } = useBrowsedChallengeContext()
  const { isActionsModalOpen, setActionsOpen } = useChallengeModals()

  const { data: challengeStatsData } = api.challenge.getChallengeStats(challenge.id ?? 0)
  const actions = challengeStatsData?.[0]?.actions

  if (!actions) return null

  return (
    <Dialog open={isActionsModalOpen} onOpenChange={setActionsOpen}>
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
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Average Time Spent</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {Math.round(actions.avgTimeSpent)}s
                </span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
