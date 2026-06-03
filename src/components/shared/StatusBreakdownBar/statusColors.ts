export const statusHexByKey: Record<string, string> = {
  created: '#22d3ee',
  fixed: '#22c55e',
  falsePositive: '#facc15',
  skipped: '#3b82f6',
  deleted: '#a1a1aa',
  alreadyFixed: '#fb923c',
  tooHard: '#ef4444',
  disabled: '#52525b',
}

export const statusLabelByKey: Record<string, string> = {
  created: 'Available',
  fixed: 'Fixed',
  falsePositive: 'False positive',
  skipped: 'Skipped',
  deleted: 'Deleted',
  alreadyFixed: 'Already fixed',
  tooHard: "Can't Complete",
  disabled: 'Disabled',
}
