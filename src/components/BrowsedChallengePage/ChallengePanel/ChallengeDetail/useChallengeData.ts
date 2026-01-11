import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useAuthContext } from '@/contexts/AuthContext'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'

export const useChallengeData = () => {
  const { challenge } = useBrowsedChallengeContext()
  const { user } = useAuthContext()

  const { data: favoriteData } = useQuery({
    ...api.challenge.isChallengeFavorited(challenge.id!),
    enabled: !!challenge.id,
  })

  const { data: likeData } = useQuery({
    ...api.challenge.isChallengeLiked(challenge.id!),
    enabled: !!challenge.id,
  })

  const { data: managedProjects } = useQuery({
    ...api.project.getManagedProjects({
      limit: 1,
      page: 0,
      onlyEnabled: false,
      onlyOwned: false,
      searchString: '',
    }),
    enabled: !!user,
  })

  const getProjectInfo = () => {
    if (!challenge.parent) return null
    if (typeof challenge.parent === 'object' && challenge.parent !== null) {
      return {
        id: (challenge.parent as { id?: number })?.id,
        name:
          (challenge.parent as { name?: string; displayName?: string })?.displayName ||
          (challenge.parent as { name?: string })?.name,
      }
    }
    if (typeof challenge.parent === 'number' || typeof challenge.parent === 'string') {
      return {
        id: Number(challenge.parent),
        name: null,
      }
    }
    return null
  }

  const projectInfo = getProjectInfo()
  const projectId = projectInfo?.id
  const projectNameFromParent = projectInfo?.name

  const { data: projectData } = useQuery({
    ...api.project.getProject(projectId),
    enabled: !!projectId && !projectNameFromParent,
  })

  const projectName = projectNameFromParent || projectData?.displayName || projectData?.name

  const ownerName =
    typeof challenge.owner === 'string'
      ? challenge.owner
      : typeof challenge.owner === 'object' && challenge.owner !== null
        ? (challenge.owner as { name?: string; osmProfile?: { displayName?: string } })?.name ||
          (challenge.owner as { osmProfile?: { displayName?: string } })?.osmProfile?.displayName
        : typeof challenge.owner === 'number'
          ? String(challenge.owner)
          : undefined

  const formatCreatedDate = (dateValue?: number | string) => {
    if (!dateValue) return null
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : new Date(dateValue * 1000)

      if (Number.isNaN(date.getTime())) return null
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return null
    }
  }

  const formattedDate = formatCreatedDate(challenge.created)
  const hasOverpass = !!(challenge as { overpassQL?: string }).overpassQL

  return {
    challenge,
    user,
    isFavorited: favoriteData?.isFavorited,
    isLiked: likeData?.isLiked,
    canClone: !!user && managedProjects && managedProjects.length > 0,
    projectId,
    projectName,
    ownerName,
    formattedDate,
    hasOverpass,
  }
}
