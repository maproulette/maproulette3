import { ChevronDown, ChevronUp, MapIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LegendRow } from './LegendRow'
import { priorityEntries, statusLegendEntries } from './taskStatusCatalog'

interface Props {
  defaultOpen?: boolean
}

export const StatusLegend = ({ defaultOpen = false }: Props) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-md bg-white/95 shadow-md backdrop-blur dark:bg-slate-900/95">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="flex w-full items-center justify-between gap-2 px-2 py-1 text-xs"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-1.5">
          <MapIcon className="size-3.5" aria-hidden="true" /> Legend
        </span>
        {open ? (
          <ChevronDown className="size-3.5" aria-hidden="true" />
        ) : (
          <ChevronUp className="size-3.5" aria-hidden="true" />
        )}
      </Button>
      {open && (
        <div className="space-y-2 border-zinc-200 border-t p-2 dark:border-slate-700">
          <div>
            <div className="mb-1 text-[10px] text-zinc-500 uppercase tracking-wide dark:text-slate-400">
              Status
            </div>
            <ul className="space-y-1">
              {statusLegendEntries.map((entry) => (
                <LegendRow key={entry.status} color={entry.color} label={entry.label} />
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-1 text-[10px] text-zinc-500 uppercase tracking-wide dark:text-slate-400">
              Priority
            </div>
            <ul className="space-y-1">
              {priorityEntries.map((entry) => (
                <LegendRow
                  key={entry.priority}
                  color={
                    entry.priority === 0 ? '#ef4444' : entry.priority === 1 ? '#f59e0b' : '#3b82f6'
                  }
                  label={entry.label}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
