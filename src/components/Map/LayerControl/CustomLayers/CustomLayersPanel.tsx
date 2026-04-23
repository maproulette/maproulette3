import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useVisibleLayers } from '@/contexts/VisibleLayersContext'
import type { CustomOverlay } from '@/types/MapLayer'
import { CustomLayerForm } from './CustomLayerForm'
import { CustomLayerRow } from './CustomLayerRow'

export const CustomLayersPanel = () => {
  const { customOverlays } = useVisibleLayers()
  const [editing, setEditing] = useState<CustomOverlay | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-xs text-zinc-500 uppercase tracking-wide dark:text-slate-400">
          Custom layers
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1 text-xs"
          onClick={() => setCreating(true)}
        >
          <Plus className="size-3" aria-hidden="true" /> Add
        </Button>
      </div>
      {customOverlays.length === 0 ? (
        <p className="px-2 text-xs text-zinc-500 dark:text-slate-400">No custom layers yet.</p>
      ) : (
        <ul>
          {customOverlays.map((overlay) => (
            <li key={overlay.id}>
              <CustomLayerRow overlay={overlay} onEdit={(o) => setEditing(o)} />
            </li>
          ))}
        </ul>
      )}
      <CustomLayerForm open={creating} onOpenChange={setCreating} />
      {editing && (
        <CustomLayerForm
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
          existing={editing}
        />
      )}
    </div>
  )
}
