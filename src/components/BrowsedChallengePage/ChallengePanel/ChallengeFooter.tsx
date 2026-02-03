import { Flag, Map as MapIcon, Play } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { useBrowsedChallengeContext } from '@/components/BrowsedChallengePage/contexts/BrowsedChallengeContext'
import { Button } from '@/components/ui/Button'
import { ChallengeModals } from './ChallengeModals'
import { ChallengeProgress } from './ChallengeProgress'

interface ChallengeFooterProps {
  isLoadingTask: boolean
  showMap: boolean
  onStartTask: () => void
  onToggleMap: () => void
}

export const ChallengeFooter = ({
  isLoadingTask,
  showMap,
  onStartTask,
  onToggleMap,
}: ChallengeFooterProps) => {
  const { challenge, existingIssue } = useBrowsedChallengeContext()
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [isOverpassModalOpen, setIsOverpassModalOpen] = useState(false)
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false)

  const { data: challengeStatsData } = api.challenge.getChallengeStats(challenge.id ?? 0)

  const challengeStats = challengeStatsData?.[0]
  const actions = challengeStats?.actions

  const handleReportSuccess = () => {
    toast.success('Report submitted successfully')
  }

  return (
    <>
      <div className="border-zinc-200/50 border-t bg-white px-6 py-8 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-950">
        <ChallengeProgress actions={actions} onViewDetails={() => setIsActionsModalOpen(true)} />

        {existingIssue && (
          <div className="mt-3 flex justify-center">
            <div
              className="group flex cursor-pointer items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50/50 px-3 py-2 transition-all hover:bg-red-100 hover:shadow-sm dark:border-red-800 dark:bg-red-900/10 dark:hover:bg-red-900/20"
              onClick={() => window.open(existingIssue.html_url, '_blank')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  window.open(existingIssue.html_url, '_blank')
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="View reported issue on GitHub"
            >
              <Flag className="size-3.5 flex-shrink-0 fill-red-600 text-red-600 drop-shadow-[0_0_4px_rgba(220,38,38,0.6)] transition-all group-hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.8)] dark:fill-red-500 dark:text-red-500 dark:drop-shadow-[0_0_4px_rgba(239,68,68,0.6)] dark:group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <p className="text-center text-red-600 text-xs dark:text-red-400">
                This challenge has been reported. Click here to view the issue.
              </p>
              <Flag className="size-3.5 flex-shrink-0 fill-red-600 text-red-600 drop-shadow-[0_0_4px_rgba(220,38,38,0.6)] transition-all group-hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.8)] dark:fill-red-500 dark:text-red-500 dark:drop-shadow-[0_0_4px_rgba(239,68,68,0.6)] dark:group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-4">
          <Button
            size="lg"
            className="w-full gap-2 bg-[#00a592] text-white shadow-md transition-all hover:bg-[#008f7d] hover:shadow-lg dark:bg-[#00a592] dark:hover:bg-[#008f7d]"
            onClick={onStartTask}
            disabled={isLoadingTask}
          >
            <Play className="size-5" />
            {isLoadingTask ? 'Loading...' : 'Start Challenge'}
          </Button>
          {/* <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
          asChild
        >
          <Link to="/manage/challenge/$challengeId" params={{ challengeId: String(challengeId) }}>
            <Settings className="size-5" />
            Manage Challenge
          </Link>
        </Button> */}
        </div>
        <div className="mt-6 md:hidden">
          <Button
            onClick={onToggleMap}
            variant="outline"
            size="lg"
            className="w-full gap-2 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <MapIcon className="size-5" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
        </div>
      </div>

      <ChallengeModals
        isReportModalOpen={isReportModalOpen}
        isCommentsModalOpen={isCommentsModalOpen}
        isOverpassModalOpen={isOverpassModalOpen}
        isCloneModalOpen={isCloneModalOpen}
        isActionsModalOpen={isActionsModalOpen}
        onReportModalChange={setIsReportModalOpen}
        onCommentsModalChange={setIsCommentsModalOpen}
        onOverpassModalChange={setIsOverpassModalOpen}
        onCloneModalChange={setIsCloneModalOpen}
        onActionsModalChange={setIsActionsModalOpen}
        onReportSuccess={handleReportSuccess}
        actions={actions}
      />
    </>
  )
}
