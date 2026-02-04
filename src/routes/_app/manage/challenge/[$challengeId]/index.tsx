import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { api } from '@/api'
import { REDIRECT_URL_KEY, userAuth } from '@/api/user/auth'
import { ManageChallengeDetail } from '@/components/ManagementPages/ManageChallengeDetail'
import type { User } from '@/types/User'
import { canManageChallenge } from '@/utils/challengePermissions'

export const Route = createFileRoute('/_app/manage/challenge/$challengeId/')({
  beforeLoad: async ({ context, params: { challengeId } }) => {
    const { queryClient } = context

    const whoamiData = await queryClient.ensureQueryData(userAuth.whoAmIOptions())
    const user: User | undefined = Array.isArray(whoamiData) ? whoamiData[0] : whoamiData

    if (!user) {
      queryClient.setQueryData(REDIRECT_URL_KEY, `/manage/challenge/${challengeId}`)
      throw redirect({
        to: '/',
      })
    }

    const challenge = await queryClient.ensureQueryData(
      api.challenge.getChallengeOptions(Number(challengeId))
    )

    if (!canManageChallenge(user, challenge)) {
      throw notFound({ throw: true })
    }
  },
  component: ManageChallengeDetail,
})
