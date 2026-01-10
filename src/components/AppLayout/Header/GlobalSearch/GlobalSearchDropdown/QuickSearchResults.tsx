import { useQuery } from '@tanstack/react-query'
import { FolderOpen, Target } from 'lucide-react'
import { api } from '@/api'
import type { ChallengeGetResponse } from '@/types/Challenge'
import type { Project } from '@/types/Project'
import { LoadingState } from '../shared/LoadingState'
import { ResultCard } from '../shared/ResultCard'

interface QuickSearchResultsProps {
  searchQuery: string
  onResultSelect: () => void
}

export const QuickSearchResults = ({ searchQuery, onResultSelect }: QuickSearchResultsProps) => {
  const trimmedQuery = searchQuery.trim()

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery(
    api.project.searchProjects({
      search: trimmedQuery,
    })
  )

  const { data: challenges = [], isLoading: isLoadingChallenges } = useQuery(
    api.challenge.searchChallenges({
      search: trimmedQuery,
    })
  )

  if (!trimmedQuery) {
    return null
  }

  if (isLoadingProjects || isLoadingChallenges) {
    return <LoadingState message="Loading..." />
  }

  const allResults = [
    ...projects.map((project: Project) => ({
      id: `project-${project.id}`,
      type: 'project' as const,
      title: project.displayName || project.name,
      href: `/browse/projects/${project.id}`,
      icon: FolderOpen,
      badge: { variant: 'default' as const, label: 'Go to project' },
    })),
    ...challenges.map((challenge: ChallengeGetResponse) => ({
      id: `challenge-${challenge.id}`,
      type: 'challenge' as const,
      title: challenge.name,
      href: '/challenge/$challengeId',
      params: { challengeId: String(challenge.id) },
      icon: Target,
      badge: { variant: 'default' as const, label: 'Go to challenge' },
    })),
  ]

  return (
    <div className="">
      {allResults.map((result) => (
        <ResultCard
          key={result.id}
          title={result.title}
          href={result.href}
          params={'params' in result ? result.params : undefined}
          onClick={onResultSelect}
          icon={result.icon}
          badge={result.badge}
        />
      ))}
    </div>
  )
}
