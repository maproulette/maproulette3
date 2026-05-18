import { AlertTriangle, Check, CircleHelp, Link2, type LucideIcon, Plus } from 'lucide-react'
import { resolveHex, STATUS_HEX_COLORS, STATUS_LABELS } from '@/lib/taskConstants'
import { PRIORITY_COLOR } from '@/types/Priority'

export interface StatusLegendEntry {
  status: number
  label: string
  color: string
  icon: LucideIcon
}

const STATUS_ICONS: Record<number, LucideIcon> = {
  0: Plus,
  1: Check,
  2: CircleHelp,
  5: Link2,
  6: AlertTriangle,
}

export const statusLegendEntries: StatusLegendEntry[] = Object.entries(STATUS_LABELS)
  .map(([status, label]) => ({
    status: Number(status),
    label,
    color: resolveHex(STATUS_HEX_COLORS[Number(status)] ?? 'zinc-400'),
    icon: STATUS_ICONS[Number(status)] ?? Plus,
  }))
  .filter((entry) => entry.status in STATUS_ICONS)

export interface PriorityLegendEntry {
  priority: 0 | 1 | 2
  label: string
  color: string
}

export const priorityEntries: PriorityLegendEntry[] = [
  { priority: 0, label: 'High priority', color: PRIORITY_COLOR[0].hex },
  { priority: 1, label: 'Medium priority', color: PRIORITY_COLOR[1].hex },
  { priority: 2, label: 'Low priority', color: PRIORITY_COLOR[2].hex },
]
