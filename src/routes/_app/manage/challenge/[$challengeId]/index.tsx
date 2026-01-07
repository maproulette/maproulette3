import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { api } from '@/api'
import { ManageChallengeDetail } from '@/components/ManagementPages/ManageChallengeDetail'
import { REDIRECT_URL_KEY } from '@/contexts/AuthContext'
import type { User } from '@/types/User'
import { canManageChallenge } from '@/utils/challengePermissions'

export const Route = createFileRoute('/_app/manage/challenge/$challengeId/')({
  beforeLoad: async ({ context, params: { challengeId } }) => {
    let user: User | undefined
    const cachedUser = context.queryClient.getQueryData(api.user.whoAmI(false).queryKey) as
      | User
      | User[]
      | undefined

    if (cachedUser) {
      user = Array.isArray(cachedUser) ? cachedUser[0] : cachedUser
    } else {
      try {
        const userData = (await context.queryClient.fetchQuery(api.user.whoAmI(false))) as
          | User
          | User[]
        user = Array.isArray(userData) ? userData[0] : userData
      } catch {
        user = undefined
      }
    }

    if (!user) {
      context.queryClient.setQueryData(REDIRECT_URL_KEY, `/manage/challenge/${challengeId}`)
      throw redirect({
        to: '/',
      })
    }

    const challenge = await context.queryClient.ensureQueryData(
      api.challenge.getChallenge(Number(challengeId))
    )

    if (!canManageChallenge(user, challenge)) {
      throw notFound({ throw: true })
    }
  },
  component: ManageChallengeDetail,
})
