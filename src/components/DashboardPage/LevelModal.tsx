import { CheckCircle2, Lock, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Progress } from '@/components/ui/Progress'
import { getAllLevelMilestones, getScoreForLevel, type LevelInfo } from '@/utils/levelUtils'

interface LevelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentLevel: number
  currentScore: number
}

export const LevelModal = ({ open, onOpenChange, currentLevel, currentScore }: LevelModalProps) => {
  const milestones = getAllLevelMilestones()

  // Calculate progress to next level using actual level thresholds
  const currentLevelScore = getScoreForLevel(currentLevel)
  const nextLevelScore = getScoreForLevel(currentLevel + 1)
  const pointsIntoLevel = currentScore - currentLevelScore
  const pointsNeededForLevel = nextLevelScore - currentLevelScore
  const progressToNext = Math.min(100, (pointsIntoLevel / pointsNeededForLevel) * 100)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto p-0">
        {/* Header */}
        <div className="border-b bg-muted/30 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/50">
                <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              Mapper Level System
            </DialogTitle>
            <DialogDescription>
              Complete challenges to earn points and level up your mapper rank
            </DialogDescription>
          </DialogHeader>

          {/* Current Progress Card */}
          <div className="mt-4 rounded-xl border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-medium">Level {currentLevel}</span>
              <span className="text-muted-foreground text-sm">
                {currentScore.toLocaleString()} total points
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to Level {currentLevel + 1}</span>
              <span className="font-semibold">
                {pointsIntoLevel.toLocaleString()} / {pointsNeededForLevel.toLocaleString()}
              </span>
            </div>
            <Progress value={progressToNext} className="h-3" />
            <p className="mt-2 text-center text-muted-foreground text-xs">
              {(pointsNeededForLevel - pointsIntoLevel).toLocaleString()} more points to next level
            </p>
          </div>
        </div>

        <div className="space-y-3 p-6">
          {milestones.map((milestone: LevelInfo) => {
            const isUnlocked = currentLevel >= milestone.level
            const isCurrent = currentLevel === milestone.level

            return (
              <div
                key={milestone.level}
                className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                  isCurrent
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-blue-200/50 shadow-lg dark:from-blue-950/40 dark:to-indigo-950/40 dark:shadow-blue-900/30'
                    : isUnlocked
                      ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-700 dark:from-green-950/30 dark:to-emerald-950/30'
                      : 'border-muted bg-muted/20'
                }`}
              >
                {/* Lock Overlay for locked levels */}
                {!isUnlocked && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full bg-muted p-4 shadow-sm">
                        <Lock className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <span className="font-semibold text-muted-foreground text-sm">
                        {(milestone.requiredScore - currentScore).toLocaleString()} points to unlock
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 p-4">
                  {/* Level Badge */}
                  <div
                    className={`relative z-20 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full font-bold text-2xl shadow-inner ${
                      isCurrent
                        ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white ring-4 ring-blue-200 dark:ring-blue-800'
                        : isUnlocked
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white ring-2 ring-green-200 dark:ring-green-800'
                          : 'bg-muted text-muted-foreground ring-2 ring-muted'
                    }`}
                  >
                    {milestone.level}
                    {isCurrent && (
                      <span className="-top-1 -right-1 absolute flex h-5 w-5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex h-5 w-5 rounded-full bg-blue-500" />
                      </span>
                    )}
                  </div>

                  {/* Level Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`font-bold text-lg ${!isUnlocked ? 'text-muted-foreground' : ''}`}
                      >
                        {milestone.emoji} {milestone.title}
                      </h3>
                      {isCurrent && (
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                          Current
                        </Badge>
                      )}
                      {isUnlocked && !isCurrent && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p
                      className={`mt-1 text-sm ${isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}
                    >
                      {milestone.requiredScore.toLocaleString()} points required
                    </p>
                    {isCurrent && (
                      <div className="mt-2">
                        <p className="font-semibold text-blue-600 text-sm dark:text-blue-400">
                          Your Score: {currentScore.toLocaleString()} points
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Formula Card */}
        <div className="mx-6 mb-6 rounded-xl border bg-muted/30 p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold">
            <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            How Leveling Works
          </h4>
          <p className="text-muted-foreground text-sm">
            Your level is calculated using:{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono">Level = √(Points / 10)</code>
          </p>
          <p className="mt-2 text-muted-foreground text-xs">
            Each level requires exponentially more points. Keep mapping to climb the ranks!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
