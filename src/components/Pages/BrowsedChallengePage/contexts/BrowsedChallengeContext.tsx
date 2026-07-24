import { useLoaderData } from '@tanstack/react-router'
import { createContext, type ReactNode, useCallback, useContext, useMemo } from 'react'
import { api } from '@/api'
import { useAuthContext } from '@/contexts/AuthContext'
import { canManageChallenge } from '@/lib/challengePermissions'
import { formatLongDate } from '@/lib/date'
import type { Challenge } from '@/types/Challenge'
import type { User } from '@/types/User'

type BrowsedChallengeContextType = {
  challenge: Challenge
  user: User | undefined
  isFavorited?: boolean
  isLiked?: boolean
  canClone?: boolean
  canManage?: boolean
  projectId?: number
  projectName?: string | null
  ownerName?: string
  formattedDate?: string | null
  hasOverpass?: boolean
  existingIssue: { html_url: string } | null
  isCheckingIssue: boolean
  isFlaggingActive: boolean
  checkForIssue: () => Promise<void>
}

const BrowsedChallengeContext = createContext<BrowsedChallengeContextType | undefined>(undefined)

export const BrowsedChallengeProvider = ({ children }: { children: ReactNode }) => {
  const { challenge } = useLoaderData({ from: '/_app/challenge/$challengeId/' })
  const { user } = useAuthContext()

  const { data: favoriteData } = api.challenge.isChallengeFavorited(challenge.id ?? 0)

  const { data: likeData } = api.challenge.isChallengeLiked(challenge.id ?? 0)

  const { data: managedProjects } = api.project.getManagedProjects({
    limit: 1,
    page: 0,
    onlyEnabled: false,
    onlyOwned: false,
    searchString: '',
  })

  const { data: projectData } = api.project.getProject(challenge.parent)

  const { data: ownerData } = api.user.getUser(challenge.owner)

  const projectName = projectData?.displayName || projectData?.name

  const formattedDate = challenge.created ? formatLongDate(new Date(challenge.created)) : null
  const hasOverpass = !!challenge.overpassQL
  const canManage = canManageChallenge(user, challenge)

  const { data: reportStatus, isFetching: isCheckingIssue, refetch } = api.challenge.useReportStatus(
    challenge.id ?? 0
  )
  const isFlaggingActive = reportStatus?.enabled ?? false
  const existingIssue = reportStatus?.existingIssue ?? null

  const checkForIssue = useCallback(async () => {
    await refetch()
  }, [refetch])

  // Reason: context value must be stable to prevent all consumers from re-rendering
  const value = useMemo<BrowsedChallengeContextType>(
    () => ({
      challenge,
      user,
      isFavorited: favoriteData?.isFavorited,
      isLiked: likeData?.isLiked,
      canClone: !!user && managedProjects && managedProjects.length > 0,
      canManage,
      projectId: challenge.parent,
      projectName,
      ownerName: ownerData?.osmProfile.displayName,
      formattedDate,
      hasOverpass,
      existingIssue,
      isCheckingIssue,
      isFlaggingActive,
      checkForIssue,
    }),
    [
      challenge,
      user,
      favoriteData?.isFavorited,
      likeData?.isLiked,
      managedProjects,
      canManage,
      projectName,
      ownerData?.osmProfile.displayName,
      formattedDate,
      hasOverpass,
      existingIssue,
      isCheckingIssue,
      isFlaggingActive,
      checkForIssue,
    ]
  )

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
