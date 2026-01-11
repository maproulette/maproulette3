import { Link } from '@tanstack/react-router'
import { Map as MapIcon, Play, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ChallengeProgress } from './ChallengeProgress'

interface ChallengeFooterProps {
  challengeId?: number | null
  completionPercentage?: number | null
  isLoadingTask: boolean
  showMap: boolean
  onStartTask: () => void
  onToggleMap: () => void
}

export const ChallengeFooter = ({
  challengeId,
  completionPercentage,
  isLoadingTask,
  showMap,
  onStartTask,
  onToggleMap,
}: ChallengeFooterProps) => {
  return (
    <div className="border-zinc-200/50 border-t p-6 pt-4 backdrop-blur-sm dark:border-zinc-800/50">
      <ChallengeProgress completionPercentage={completionPercentage ?? undefined} />

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          className="w-full gap-2 bg-[#00a592] text-white shadow-md transition-all hover:bg-[#008f7d] hover:shadow-lg dark:bg-[#00a592] dark:hover:bg-[#008f7d]"
          onClick={onStartTask}
          disabled={isLoadingTask}
        >
          <Play className="size-5" />
          {isLoadingTask ? 'Loading...' : 'Start Task'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
          asChild
        >
          <Link to="/manage/challenge/$challengeId" params={{ challengeId: String(challengeId) }}>
            <Settings className="size-5" />
            Manage Challenge
          </Link>
        </Button>
      </div>

      <div className="mt-4 md:hidden">
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
  )
}
