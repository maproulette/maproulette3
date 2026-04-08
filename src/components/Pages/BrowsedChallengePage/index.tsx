import { useLoaderData } from '@tanstack/react-router'
import { BrowsedChallengeProvider } from '@/components/Pages/BrowsedChallengePage/contexts/BrowsedChallengeContext'
import { BrowsedChallengeSearchContextProvider } from '@/components/Pages/BrowsedChallengePage/contexts/BrowsedChallengeSearchContext'
import { DrawerPortalProvider } from '@/components/TaskInfoPanel/DrawerPortalContext'
import { useSetPageTitleContext } from '@/contexts/PageTitleContext'
import { BrowsedChallengePageContent } from './BrowsedChallengePageContent'

export const BrowsedChallengePage = () => {
  const { challenge } = useLoaderData({ from: '/_app/challenge/$challengeId/' })
  useSetPageTitleContext(challenge?.name ?? null)

  return (
    <BrowsedChallengeSearchContextProvider>
      <BrowsedChallengeProvider>
        <DrawerPortalProvider>
          <BrowsedChallengePageContent />
        </DrawerPortalProvider>
      </BrowsedChallengeProvider>
    </BrowsedChallengeSearchContextProvider>
  )
}
