import { STATUS_HEX, STATUS_KEY_TO_ID } from '@/lib/taskConstants'

const hexForKey = (key: string): string => STATUS_HEX[STATUS_KEY_TO_ID[key] ?? -1] ?? '#71717a'

export const statusHexByKey: Record<string, string> = {
  created: hexForKey('created'),
  fixed: hexForKey('fixed'),
  falsePositive: hexForKey('falsePositive'),
  skipped: hexForKey('skipped'),
  deleted: hexForKey('deleted'),
  alreadyFixed: hexForKey('alreadyFixed'),
  tooHard: hexForKey('tooHard'),
  disabled: hexForKey('disabled'),
}

// Labels here intentionally diverge from STATUS_LABELS: in the action-breakdown context, "created"
// means "available to work on" rather than the historical "Created" status name.
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
