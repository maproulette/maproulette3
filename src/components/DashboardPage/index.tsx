import { useAuthContext } from '@/contexts/AuthContext'
import { AuthGuard } from '../shared/AuthGuard'
import { ContributionsSection } from './ContributionsSection'
import { DashboardHeader } from './DashboardHeader'
import { LockedTasksSection } from './LockedTasksSection'
import { SavedChallengesSection } from './SavedChallengesSection'
import { SavedTasksSection } from './SavedTasksSection'
import { TeamsSection } from './TeamsSection'

export const Dashboard = () => {
  const { user } = useAuthContext()

  return (
    <AuthGuard>
      {user && (
        <div className="flex h-[calc(100vh-7rem)] w-full flex-col gap-4 overflow-hidden rounded-lg bg-zinc-100 p-4 dark:bg-zinc-950">
          {/* Compact User Progress Header */}
          <DashboardHeader user={user} />

          {/* Main Content Grid - 3 columns on large screens */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-3">
            {/* Left Column: Locked Tasks + Teams */}
            <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
              <LockedTasksSection userId={user.id} />
              <SavedTasksSection userId={user.id} />
            </div>

            {/* Middle Column: Saved Challenges */}
            <div className="min-h-0 overflow-hidden">
              <SavedChallengesSection userId={user.id} />
            </div>

            {/* Right Column: Saved Tasks + Contributions */}
            <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
              <ContributionsSection userId={user.id} />
              <TeamsSection userId={user.id} />
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
