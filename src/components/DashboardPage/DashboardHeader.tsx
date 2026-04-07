import { CalendarDays, Navigation, Shield, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { formatDate, getAccountAge } from '@/components/formatDate'
import {
  calculateLevel,
  calculateNextLevelProgress,
  getLevelInfo,
  getScoreForLevel,
} from '@/components/levelUtils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { initials as getInitials } from '@/components/utils'
import type { User } from '@/types/User'
import { LevelModal } from './LevelModal'

interface DashboardHeaderProps {
  user: User
}

export const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const [levelModalOpen, setLevelModalOpen] = useState(false)

  const userLevel = calculateLevel(user.score || 0)
  const levelProgress = calculateNextLevelProgress(user.score || 0)
  const currentLevelScore = getScoreForLevel(userLevel)
  const nextLevelScore = getScoreForLevel(userLevel + 1)
  const pointsIntoLevel = (user.score || 0) - currentLevelScore
  const pointsNeededForLevel = nextLevelScore - currentLevelScore
  const { title: levelTitle, emoji: levelEmoji } = getLevelInfo(userLevel)
  const accountAge = getAccountAge(user.created)

  return (
    <>
      <div className="flex shrink-0 items-center gap-4 rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:bg-zinc-800/50 dark:shadow-none">
        {/* Avatar with level badge */}
        <div className="relative shrink-0">
          <Avatar className="h-14 w-14 ring-2 ring-blue-500/50">
            <AvatarImage src={user.osmProfile.avatarURL || ''} alt={user.osmProfile.displayName} />
            <AvatarFallback className="bg-zinc-200 font-bold text-lg dark:bg-zinc-700">
              {getInitials(user.osmProfile.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="-bottom-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs ring-2 ring-zinc-100 dark:ring-zinc-900">
            {userLevel}
          </div>
        </div>

        {/* User Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-semibold text-lg text-zinc-900 dark:text-white">
              {user.osmProfile.displayName}
            </h1>
            {!user.guest && (
              <Badge className="shrink-0 bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30">
                <Shield className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            )}
            {user.guest && (
              <Badge className="shrink-0 bg-yellow-500/20 text-xs text-yellow-400 hover:bg-yellow-500/30">
                <Sparkles className="mr-1 h-3 w-3" />
                Guest
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={() => setLevelModalOpen(true)}
            className="text-left text-blue-400 text-sm transition-colors hover:text-blue-300"
          >
            {levelEmoji} {levelTitle}
          </button>
        </div>

        {/* Level Progress */}
        <button
          type="button"
          onClick={() => setLevelModalOpen(true)}
          className="hidden w-48 shrink-0 cursor-pointer rounded-lg p-2 text-left transition-colors hover:bg-zinc-100 sm:block dark:hover:bg-zinc-700/50"
        >
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Level {userLevel}</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {(user.score || 0).toLocaleString()} pts
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <div className="mt-1 text-right text-xs text-zinc-400 dark:text-zinc-500">
            {pointsIntoLevel.toLocaleString()} / {pointsNeededForLevel.toLocaleString()} to next
            level
          </div>
        </button>

        {/* Stats */}
        <div className="hidden shrink-0 items-center gap-3 text-xs lg:flex">
          <div className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1.5 dark:bg-zinc-700/50">
            <CalendarDays className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
            <span className="text-zinc-600 dark:text-zinc-300">{formatDate(user.created)}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1.5 dark:bg-zinc-700/50">
            <Navigation className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            <span className="text-zinc-600 dark:text-zinc-300">{accountAge} days</span>
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
