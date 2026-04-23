import { Flame } from 'lucide-react'

interface Props {
  count: number
}

export const StreakMilestoneContent = ({ count }: Props) => (
  <div className="flex flex-col items-center gap-3 text-center">
    <Flame className="size-14 text-orange-500" aria-hidden="true" />
    <div>
      <h2 className="font-bold text-xl">Hot streak!</h2>
      <p className="text-zinc-600 dark:text-slate-400">{count} tasks in a row — keep it going.</p>
    </div>
  </div>
)
