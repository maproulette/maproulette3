import { Award, Globe, Shield, Star, Target, Trophy, Users, Zap } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { AuthGuard } from '../shared/AuthGuard'
import { AchievementsSection } from './AchievementsSection'
import { DashboardHeader } from './DashboardHeader'
import { GrantsCard } from './GrantsCard'
import { ProfileDetailsCard } from './ProfileDetailsCard'
import { StatsCard } from './StatsCard'

export const Dashboard = () => {
  const { user } = useAuthContext()

  return (
    <AuthGuard>
      {user && (
        <div className="min-h-screen p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Epic Header with Level System */}
            <DashboardHeader user={user} />

            {/* Enhanced Stats Grid with Icons and Colors */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Experience Points"
                value={user.score || 0}
                description="Total mapping XP earned"
                icon={Trophy}
                iconColor="text-blue-600 dark:text-blue-400"
                borderColor="border-blue-200/50 dark:border-blue-500/30"
                valueColor="text-blue-600 dark:text-blue-400"
                descriptionIcon={Zap}
              />

              <StatsCard
                title="Badges Earned"
                value={user.achievements?.length || 0}
                description="Achievements unlocked"
                icon={Award}
                iconColor="text-yellow-600 dark:text-yellow-400"
                borderColor="border-yellow-200/50 dark:border-yellow-500/30"
                valueColor="text-yellow-600 dark:text-yellow-400"
                descriptionIcon={Star}
              />

              <StatsCard
                title="Mapping Party"
                value={user.followingGroupId ? 'Active' : 'Solo'}
                description={user.followingGroupId ? 'Following a group' : 'Exploring alone'}
                icon={Users}
                iconColor="text-green-600 dark:text-green-400"
                borderColor="border-green-200/50 dark:border-green-500/30"
                valueColor="text-green-600 dark:text-green-400"
                descriptionIcon={Globe}
              />

              <StatsCard
                title="Access Level"
                value={user.grants?.length || 0}
                description="Permission grants"
                icon={Shield}
                iconColor="text-purple-600 dark:text-purple-400"
                borderColor="border-purple-200/50 dark:border-purple-500/30"
                valueColor="text-purple-600 dark:text-purple-400"
                descriptionIcon={Target}
              />
            </div>

            {/* Detailed Information Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ProfileDetailsCard user={user} />
              <GrantsCard user={user} />
            </div>

            {/* Achievements Section - Trophy Showcase */}
            <AchievementsSection user={user} />
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
