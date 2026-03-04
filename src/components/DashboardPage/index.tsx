import { useAuthContext } from '@/contexts/AuthContext'
import { AuthGuard } from '../shared/AuthGuard'
import { ContributionsSection } from './ContributionsSection'
import { LockedTasksSection } from './LockedTasksSection'
import { SavedChallengesSection } from './SavedChallengesSection'
import { TeamsSection } from './TeamsSection'
import { UserProfileSection } from './UserProfileSection'

export const Dashboard = () => {
  const { user } = useAuthContext()

  return (
    <AuthGuard>
      {user && (
        <div className="h-[calc(100vh-5rem)] w-full overflow-hidden px-4 py-2">
          <div className="grid h-full grid-cols-1 gap-4 overflow-hidden lg:grid-cols-3">
            {/* Middle Column: Saved Challenges + Locked Tasks */}
            <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
              <SavedChallengesSection userId={user.id} />
              <LockedTasksSection userId={user.id} />
            </div>

            {/* Middle Column: User Profile & Points */}
            <div className="flex min-h-0 flex-col overflow-hidden">
              <UserProfileSection user={user} />
            </div>

            {/* Right Column: Contributions + Teams */}
            <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
              <ContributionsSection />
              <TeamsSection userId={user.id} />
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
