import { Award, Trophy } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { User } from '@/types/User'

interface AchievementsSectionProps {
  user: User
}

export const AchievementsSection = ({ user }: AchievementsSectionProps) => {
  if (!user.achievements || user.achievements.length === 0) {
    return null
  }

  return (
    <Card className="border-2 border-yellow-200/50 dark:border-yellow-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-2">
              <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-2xl">Trophy Collection</CardTitle>
              <CardDescription>
                🎉 You've earned {user.achievements.length} epic badge
                {user.achievements.length !== 1 ? 's' : ''}!
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {user.achievements.map((achievement) => (
            <div
              key={achievement}
              className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-yellow-300/50 bg-gradient-to-br from-yellow-100 to-orange-100 p-4 shadow-md transition-all hover:scale-110 hover:shadow-xl dark:border-yellow-500/30 dark:from-yellow-900/30 dark:to-orange-900/30"
            >
              <div className="rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-3 shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <span className="text-center font-semibold text-xs">Badge #{achievement}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
