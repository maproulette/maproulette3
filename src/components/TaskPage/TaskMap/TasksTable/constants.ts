export const STATUS_LABELS: Record<number, string> = {
  0: 'Created',
  1: 'Fixed',
  2: 'False Positive',
  3: 'Skipped',
  4: 'Deleted',
  5: 'Too Hard',
  6: 'Already Fixed',
  7: 'Answered',
  8: 'Validated',
  9: 'Disabled',
}

export const STATUS_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  1: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  3: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  4: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  5: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  6: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  7: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  8: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  9: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
}

export const PRIORITY_LABELS: Record<number, string> = {
  0: 'High',
  1: 'Medium',
  2: 'Low',
}

