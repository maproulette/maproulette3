import { useLoaderData } from '@tanstack/react-router'
import { BrowsedProjectProvider } from '@/components/BrowsedProjectPage/contexts/BrowsedProjectContext'
import { useSetPageTitle } from '@/contexts/PageTitleContext'
import { ChallengesList } from './ChallengesList'
import { ProjectDetail } from './ProjectDetail'

export const BrowsedProjectPage = () => {
  const { project } = useLoaderData({ from: '/_app/project/$projectId/' })
  const projectName =
    project && ('displayName' in project ? (project.displayName as string) : null) ||
    (project && 'name' in project ? (project.name as string) : null)
  useSetPageTitle(projectName ?? null)

  return (
    <BrowsedProjectProvider>
      <div className="flex h-[calc(100vh-7rem)] flex-row gap-0 overflow-hidden">
        {/* Left Panel - Project Detail */}
        <div className="w-96 shrink-0 border-zinc-200 border-r bg-white dark:border-zinc-800 dark:bg-zinc-950">
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
