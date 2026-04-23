import { Crown } from 'lucide-react'

interface Props {
  level: number
  score: number
}

export const LevelUpContent = ({ level, score }: Props) => (
  <div className="flex flex-col items-center gap-3 text-center">
    <Crown className="size-14 text-amber-500" aria-hidden="true" />
    <div>
      <h2 className="font-bold text-xl">You leveled up!</h2>
      <p className="text-zinc-600 dark:text-slate-400">
        Welcome to level {level}. You've reached {score.toLocaleString()} points.
      </p>
    </div>
  </div>
)
