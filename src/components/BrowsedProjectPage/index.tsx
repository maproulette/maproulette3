import { BrowsedProjectProvider } from '@/contexts/browseProject/BrowsedProjectContext'
import { ChallengesList } from './ChallengesList'
import { ProjectDetail } from './ProjectDetail'

export const BrowsedProjectPage = () => {
  return (
    <BrowsedProjectProvider>
      <div className="flex h-[calc(100vh-7rem)] flex-row gap-0 overflow-hidden">
        {/* Left Panel - Project Detail */}
        <div className="w-96 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <ProjectDetail />
        </div>
        {/* Right Panel - Challenges List (wider) */}
        <div className="flex-1 overflow-hidden bg-zinc-50 dark:bg-zinc-900">
          <ChallengesList />
        </div>
      </div>
    </BrowsedProjectProvider>
  )
}
