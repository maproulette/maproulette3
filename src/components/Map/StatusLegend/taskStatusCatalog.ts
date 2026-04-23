import { resolveHex, STATUS_HEX_COLORS, STATUS_LABELS } from '@/lib/taskConstants'

export interface StatusLegendEntry {
  status: number
  label: string
  color: string
}

export const statusLegendEntries: StatusLegendEntry[] = Object.entries(STATUS_LABELS)
  .map(([status, label]) => ({
    status: Number(status),
    label,
    color: resolveHex(STATUS_HEX_COLORS[Number(status)] ?? 'zinc-400'),
  }))
  .filter((entry) => [0, 1, 2, 3, 5, 6].includes(entry.status))

export const priorityEntries = [
  { priority: 0, label: 'High priority', letter: 'H' },
  { priority: 1, label: 'Medium priority', letter: 'M' },
  { priority: 2, label: 'Low priority', letter: 'L' },
]
