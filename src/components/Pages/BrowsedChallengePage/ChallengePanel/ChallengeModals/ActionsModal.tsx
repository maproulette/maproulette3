import { api } from '@/api'
import { useBrowsedChallengeContext } from '@/components/Pages/BrowsedChallengePage/contexts/BrowsedChallengeContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Separator } from '@/components/ui/Separator'
import { StatCard, StatCardGrid } from '@/components/ui/StatCard'
import { useChallengeModals } from './ChallengeModalsContext'

export const ActionsModal = () => {
  const { challenge } = useBrowsedChallengeContext()
  const { isActionsModalOpen, setActionsOpen } = useChallengeModals()

  const { data: challengeStatsData } = api.challenge.getChallengeStats(challenge.id ?? 0)
  const actions = challengeStatsData?.[0]?.actions

  if (!actions) return null

  return (
    <Dialog open={isActionsModalOpen} onOpenChange={setActionsOpen}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Task Activity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <StatCardGrid className="grid-cols-2 sm:grid-cols-2">
            <StatCard tone="success" size="sm" label="Fixed" value={actions.fixed || 0} />
            <StatCard
              tone="warning"
              size="sm"
              label="False Positive"
              value={actions.falsePositive || 0}
            />
            <StatCard tone="muted" size="sm" label="Skipped" value={actions.skipped || 0} />
            <StatCard tone="info" size="sm" label="Available" value={actions.available || 0} />
            {actions.deleted !== undefined && actions.deleted > 0 && (
              <StatCard tone="danger" size="sm" label="Deleted" value={actions.deleted} />
            )}
            {actions.alreadyFixed !== undefined && actions.alreadyFixed > 0 && (
              <StatCard tone="info" size="sm" label="Already Fixed" value={actions.alreadyFixed} />
            )}
            {actions.tooHard !== undefined && actions.tooHard > 0 && (
              <StatCard tone="warning" size="sm" label="Too Hard" value={actions.tooHard} />
            )}
            {actions.validated !== undefined && actions.validated > 0 && (
              <StatCard tone="success" size="sm" label="Validated" value={actions.validated} />
            )}
          </StatCardGrid>
          <Separator />
          <div className="flex items-center justify-between px-1">
            <span className="font-semibold text-sm text-zinc-900 dark:text-white">Total</span>
            <span className="font-bold text-base text-zinc-900 dark:text-white">
              {actions.total || 0}
            </span>
          </div>
          {actions.avgTimeSpent !== undefined && actions.avgTimeSpent > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-zinc-600 dark:text-slate-400">
                  Average Time Spent
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">
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
