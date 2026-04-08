import { useLoaderData } from '@tanstack/react-router'
import { useSetPageTitleContext } from '@/contexts/PageTitleContext'
import { ChallengesList } from './ChallengesList'
import { ProjectDetail } from './ProjectDetail'

export const BrowsedProjectPageContent = () => {
  const { project } = useLoaderData({ from: '/_app/project/$projectId/' }) as {
    project: { displayName?: string; name?: string }
  }
  const projectName = project?.displayName || project?.name || null
  useSetPageTitleContext(projectName ?? null)

  return (
    <div className="flex h-full flex-row gap-0 overflow-hidden">
      {/* Left Panel - Project Detail */}
      <div className="w-96 shrink-0 border-zinc-200 border-r bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <ProjectDetail />
      </div>
      {/* Right Panel - Challenges List (wider) */}
      <div className="flex-1 overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        <ChallengesList />
      </div>
    </div>
  )
}
