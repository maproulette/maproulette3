import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

interface Props<TKey extends string> {
  open: boolean
  onOpenChange: (open: boolean) => void
  available: TKey[]
  added: TKey[]
  labels: Record<TKey, string>
  onAdd: (key: TKey) => void
  onRemove: (key: TKey) => void
  onMove: (key: TKey, direction: -1 | 1) => void
  onReset?: () => void
}

export const ConfigureColumnsDialog = <TKey extends string>({
  open,
  onOpenChange,
  available,
  added,
  labels,
  onAdd,
  onRemove,
  onMove,
  onReset,
}: Props<TKey>) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Configure columns</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="mb-2 font-medium text-sm">Available</h3>
            <ul className="max-h-80 space-y-1 overflow-auto rounded-md border border-zinc-200 p-2 dark:border-slate-700">
              {available.length === 0 && (
                <li className="text-xs text-zinc-500 dark:text-slate-400">All columns added.</li>
              )}
              {available.map((key) => (
                <li key={key} className="flex items-center justify-between text-sm">
                  <span>{labels[key]}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => onAdd(key)}>
                    <Plus className="size-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-medium text-sm">Shown</h3>
            <ul className="max-h-80 space-y-1 overflow-auto rounded-md border border-zinc-200 p-2 dark:border-slate-700">
              {added.map((key, index) => (
                <li key={key} className="flex items-center gap-1 text-sm">
                  <span className="flex-1">{labels[key]}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onMove(key, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onMove(key, 1)}
                    disabled={index === added.length - 1}
                    aria-label="Move down"
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(key)}>
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          {onReset && (
            <Button variant="ghost" onClick={onReset}>
              Reset
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
