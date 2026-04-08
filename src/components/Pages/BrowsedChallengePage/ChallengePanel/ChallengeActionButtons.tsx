import { Code, Copy, Flag, MoreVertical } from 'lucide-react'
import { useBrowsedChallengeContext } from '@/components/Pages/BrowsedChallengePage/contexts/BrowsedChallengeContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useChallengeModals } from './ChallengeModals/ChallengeModalsContext'

export const ChallengeActionButtons = () => {
  const { hasOverpass, canClone, user, existingIssue } = useBrowsedChallengeContext()
  const { openReport, openOverpass, openClone } = useChallengeModals()

  const handleReport = () => {
    if (existingIssue) {
      window.open(existingIssue.html_url, '_blank')
    } else {
      openReport()
    }
  }

  const isReportDisabled = !user || !!existingIssue
  const reportTitle = !user
    ? 'You must be logged in to report a challenge'
    : existingIssue
      ? 'This challenge has already been reported'
      : 'Report challenge'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:text-zinc-400 dark:focus:ring-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          aria-label="Challenge actions"
        >
          <MoreVertical className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hasOverpass && (
          <DropdownMenuItem onClick={openOverpass}>
            <Code className="size-4" />
            Overpass Query
          </DropdownMenuItem>
        )}
        {canClone && (
          <DropdownMenuItem onClick={openClone}>
            <Copy className="size-4" />
            Clone Challenge
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={handleReport}
          disabled={isReportDisabled}
          title={reportTitle}
          className={existingIssue ? 'data-[disabled]:opacity-100' : ''}
        >
          <Flag
            className={`size-4 transition-all ${
              existingIssue
                ? 'fill-red-600 text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)] dark:fill-red-500 dark:text-red-500 dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                : ''
            }`}
          />
          {existingIssue ? 'Challenge Reported' : 'Report Challenge'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
