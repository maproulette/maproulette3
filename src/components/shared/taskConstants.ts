export const STATUS_LABELS: Record<number, string> = {
  0: 'Created',
  1: 'Fixed',
  2: 'False Positive',
  3: 'Skipped',
  4: 'Deleted',
  5: 'Already Fixed',
  6: 'Too Hard',
  7: 'Answered',
  8: 'Validated',
  9: 'Disabled',
}

export const STATUS_COLORS: Record<number, string> = {
  0: 'bg-zinc-500',
  1: 'bg-green-500',
  2: 'bg-red-500',
  3: 'bg-yellow-500',
  4: 'bg-zinc-400',
  5: 'bg-blue-500',
  6: 'bg-orange-500',
}

export const TAILWIND_HEX: Record<string, string> = {
  'cyan-400': '#22d3ee',
  'green-500': '#22c55e',
  'yellow-400': '#facc15',
  'red-500': '#ef4444',
  'orange-400': '#fb923c',
}

export const STATUS_HEX_COLORS: Record<number, string> = {
  0: 'cyan-400',
  1: 'green-500',
  2: 'yellow-400',
  3: 'cyan-400',
  4: 'red-500',
  5: 'orange-400',
  6: 'red-500',
}

export const resolveHex = (twColor: string): string => TAILWIND_HEX[twColor] ?? twColor

export const STATUS_BADGE_COLORS: Record<number, string> = {
  0: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  1: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  2: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  3: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  4: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  5: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  6: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
}

export const tabTriggerClass =
  'gap-1.5 rounded-none border-transparent border-b-2 bg-transparent px-3 py-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400'
