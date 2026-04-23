import { api } from '@/api'
import { Loader } from '@/components/ui/Loader'
import { useAuthContext } from '@/contexts/AuthContext'
import type { User } from '@/types/User'
import { ProfilePageProvider } from './contexts/ProfilePageContext'
import { ProfileHeader } from './ProfileHeader'
import { AchievementsSection } from './sections/AchievementsSection'
import { MetricsSection } from './sections/MetricsSection'
import { TopChallengesSection } from './sections/TopChallengesSection'

interface Props {
  userId?: number
}

export const ProfilePage = ({ userId }: Props = {}) => {
  const { user: authedUser } = useAuthContext()
  const isViewingOther = userId !== undefined && userId !== authedUser?.id
  const publicUserQuery = api.user.getUser(isViewingOther ? userId : 0)
  const user: User | undefined = isViewingOther ? publicUserQuery.data : authedUser

  if (isViewingOther && publicUserQuery.isLoading) {
    return <Loader />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-500 dark:text-slate-400">
          {isViewingOther
            ? "Couldn't load that user's profile."
            : 'Please log in to view your profile'}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12">
      <ProfileHeader user={user} showLivePoints={!isViewingOther} />
      <ProfilePageProvider userId={user.id}>
        <div className="space-y-10">
          <MetricsSection />
          <TopChallengesSection />
          <AchievementsSection earnedIds={user.achievements ?? []} />
        </div>
      </ProfilePageProvider>
    </div>
  )
}
