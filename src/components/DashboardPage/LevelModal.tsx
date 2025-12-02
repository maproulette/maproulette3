import { CheckCircle2, Lock, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { getAllLevelMilestones, type LevelInfo } from '@/utils/levelUtils'

interface LevelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentLevel: number
  currentScore: number
}

export const LevelModal = ({ open, onOpenChange, currentLevel, currentScore }: LevelModalProps) => {
  const milestones = getAllLevelMilestones()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Mapper Level System
          </DialogTitle>
          <DialogDescription>
            Complete challenges to earn points and level up your mapper rank
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {milestones.map((milestone: LevelInfo) => {
            const isUnlocked = currentLevel >= milestone.level
            const isCurrent = currentLevel === milestone.level
            const hasEnoughScore = currentScore >= milestone.requiredScore

            return (
              <div
                key={milestone.level}
                className={`relative flex items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50 shadow-md dark:bg-blue-950/30'
                    : isUnlocked
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                      : 'border-muted bg-muted/30'
                }`}
              >
                {/* Level Icon */}
                <div
                  className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 font-bold text-2xl ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : isUnlocked
                        ? 'border-green-500 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'border-muted bg-background text-muted-foreground'
                  }`}
                >
                  {milestone.level}
                </div>

                {/* Level Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">
                      {milestone.emoji} {milestone.title}
                    </h3>
                    {isCurrent && <Badge className="bg-blue-500">Current Level</Badge>}
                    {isUnlocked && !isCurrent && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {!hasEnoughScore && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Required: {milestone.requiredScore.toLocaleString()} points
                  </p>
                  {isCurrent && (
                    <p className="mt-1 font-medium text-blue-600 text-sm dark:text-blue-400">
                      Your Score: {currentScore.toLocaleString()} points
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20">
          <h4 className="mb-2 flex items-center gap-2 font-semibold">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Level Formula
          </h4>
          <p className="text-muted-foreground text-sm">
            Your level is calculated using the formula:{' '}
            <code className="rounded bg-muted px-1 py-0.5">Level = √(Points / 10)</code>
          </p>
          <p className="mt-2 text-muted-foreground text-sm">
            Each level requires exponentially more points. Keep mapping to climb the ranks!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
