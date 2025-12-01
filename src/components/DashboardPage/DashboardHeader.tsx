import { CalendarDays, Compass, Flag, MapPin, Navigation, Shield, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { User } from '@/types/User'
import { formatDate, getAccountAge, getInitials } from '@/utils/formatUtils'
import {
  calculateLevel,
  calculateNextLevelProgress,
  getLevelInfo,
  getScoreForLevel,
} from '@/utils/levelUtils'
import { LevelModal } from './LevelModal'

interface DashboardHeaderProps {
  user: User
}

export const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const [levelModalOpen, setLevelModalOpen] = useState(false)

  const userLevel = calculateLevel(user.score || 0)
  const levelProgress = calculateNextLevelProgress(user.score || 0)
  const nextLevelScore = getScoreForLevel(userLevel + 1)
  const { title: levelTitle, emoji: levelEmoji } = getLevelInfo(userLevel)
  const accountAge = getAccountAge(user.created)

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border-2 border-blue-200/50 p-8 shadow-lg backdrop-blur dark:border-blue-500/30">
        {/* Decorative map pins in background */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <MapPin className="absolute top-4 left-20 h-12 w-12 text-blue-500" />
          <Flag className="absolute right-16 bottom-8 h-10 w-10 text-green-500" />
          <Compass className="absolute top-12 right-32 h-14 w-14 text-yellow-500" />
        </div>

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-blue-500/30 shadow-xl ring-4 ring-blue-500/10">
              <AvatarImage
                src={user.osmProfile.avatarURL || ''}
                alt={user.osmProfile.displayName}
              />
              <AvatarFallback className="font-bold text-3xl text-white">
                {getInitials(user.osmProfile.displayName)}
              </AvatarFallback>
            </Avatar>
            {/* Level badge on avatar */}
            <div className="-bottom-2 -right-2 absolute flex h-12 w-12 items-center justify-center rounded-full border-4 border-background font-bold text-white shadow-lg">
              {userLevel}
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-bold text-4xl tracking-tight">{user.osmProfile.displayName}</h1>
              {!user.guest && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified Mapper
                </Badge>
              )}
              {user.guest && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Guest Explorer
                </Badge>
              )}
            </div>

            <button
              type="button"
              onClick={() => setLevelModalOpen(true)}
              className="text-left font-semibold text-blue-600 text-lg transition-all hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              {levelEmoji} {levelTitle}
            </button>

            {/* Level Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Level {userLevel} → {userLevel + 1}
                </span>
                <span className="text-muted-foreground">
                  {user.score?.toLocaleString() || 0} / {nextLevelScore.toLocaleString()} XP
                </span>
              </div>
              <div className="relative h-4 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm">
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Since {formatDate(user.created)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur">
                <Navigation className="h-4 w-4 text-green-500" />
                <span className="font-medium">{accountAge} days exploring</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LevelModal
        open={levelModalOpen}
        onOpenChange={setLevelModalOpen}
        currentLevel={userLevel}
        currentScore={user.score || 0}
      />
    </>
  )
}
