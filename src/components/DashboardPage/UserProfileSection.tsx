import { CalendarDays, Navigation, Shield, Sparkles } from 'lucide-react'
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

interface UserProfileSectionProps {
  user: User
}

export const UserProfileSection = ({ user }: UserProfileSectionProps) => {
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
      <div className="flex h-full flex-col rounded-xl bg-white shadow-sm dark:bg-zinc-900 dark:shadow-none">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-3 border-b border-zinc-100 p-6 dark:border-zinc-800">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-2 ring-blue-500/50">
              <AvatarImage
                src={user.osmProfile.avatarURL || ''}
                alt={user.osmProfile.displayName}
              />
              <AvatarFallback className="bg-zinc-200 font-bold text-2xl dark:bg-zinc-700">
                {getInitials(user.osmProfile.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="-bottom-1 -right-1 absolute flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 font-bold text-sm text-white ring-2 ring-white dark:ring-zinc-900">
              {userLevel}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-semibold text-lg text-zinc-900 dark:text-white">
                {user.osmProfile.displayName}
              </h1>
              {!user.guest && (
                <Badge className="bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
              {user.guest && (
                <Badge className="bg-yellow-500/20 text-xs text-yellow-400 hover:bg-yellow-500/30">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Guest
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={() => setLevelModalOpen(true)}
              className="mt-1 text-blue-400 text-sm transition-colors hover:text-blue-300"
            >
              {levelEmoji} {levelTitle}
            </button>
          </div>
        </div>

        {/* Level Progress */}
        <button
          type="button"
          onClick={() => setLevelModalOpen(true)}
          className="cursor-pointer border-b border-zinc-100 px-6 py-4 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
        >
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Level {userLevel}</span>
            <span className="font-semibold text-zinc-900 dark:text-white">
              {(user.score || 0).toLocaleString()} pts
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <div className="mt-2 text-right text-xs text-zinc-400 dark:text-zinc-500">
            {pointsIntoLevel.toLocaleString()} / {pointsNeededForLevel.toLocaleString()} to next
            level
          </div>
        </button>

        {/* Stats */}
        <div className="flex flex-col gap-3 p-6">
          <div className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
            <CalendarDays className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
            <div className="min-w-0">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Joined</p>
              <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                {formatDate(user.created)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
            <Navigation className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
            <div className="min-w-0">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Account age</p>
              <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                {accountAge} days
              </p>
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
