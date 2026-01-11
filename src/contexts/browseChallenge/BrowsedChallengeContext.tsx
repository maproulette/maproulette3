import { useQuery } from '@tanstack/react-query'
import { useLoaderData } from '@tanstack/react-router'
import { createContext, type ReactNode, useContext } from 'react'
import { api } from '@/api'
import { useAuthContext } from '@/contexts/AuthContext'
import type { Challenge } from '@/types/Challenge'

type BrowsedChallengeContextType = {
  challenge: Challenge
  user: unknown
  isFavorited?: boolean
  isLiked?: boolean
  canClone?: boolean
  projectId?: number
  projectName?: string | null
  ownerName?: string
  formattedDate?: string | null
  hasOverpass?: boolean
}

const BrowsedChallengeContext = createContext<BrowsedChallengeContextType | undefined>(undefined)

export const BrowsedChallengeProvider = ({ children }: { children: ReactNode }) => {
  const loaderData = useLoaderData({ from: '/_app/challenge/$challengeId/' })
  const { user } = useAuthContext()

  if (!loaderData) {
    throw new Error('Challenge data not found')
  }

  const { challenge }: { challenge: Challenge } = loaderData

  const { data: favoriteData } = useQuery({
    ...api.challenge.isChallengeFavorited(challenge.id ?? 0),
    enabled: !!challenge.id,
  })

  const { data: likeData } = useQuery({
    ...api.challenge.isChallengeLiked(challenge.id ?? 0),
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

  const { data: ownerData } = useQuery({
    ...api.user.getUser(challenge.owner),
    enabled: !!challenge.owner,
  })

  const projectName = projectNameFromParent || projectData?.displayName || projectData?.name

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
  console.log(ownerData)
  const value: BrowsedChallengeContextType = {
    challenge,
    user,
    isFavorited: favoriteData?.isFavorited,
    isLiked: likeData?.isLiked,
    canClone: !!user && managedProjects && managedProjects.length > 0,
    projectId,
    projectName,
    ownerName: ownerData?.osmProfile.displayName,
    formattedDate,
    hasOverpass,
  }

  return (
    <BrowsedChallengeContext.Provider value={value}>{children}</BrowsedChallengeContext.Provider>
  )
}

export const useBrowsedChallengeContext = () => {
  const context = useContext(BrowsedChallengeContext)

  if (context === undefined) {
    throw new Error('useBrowsedChallenge must be used within a BrowsedChallengeProvider')
  }

  return context
}
