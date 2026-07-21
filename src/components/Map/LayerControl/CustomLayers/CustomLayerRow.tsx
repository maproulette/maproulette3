import { Pencil, Trash2 } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { useVisibleLayers } from '@/contexts/VisibleLayersContext'
import { useIntl } from '@/i18n'
import type { CustomOverlay } from '@/types/MapLayer'

interface Props {
  overlay: CustomOverlay
  onEdit: (overlay: CustomOverlay) => void
}

export const CustomLayerRow = ({ overlay, onEdit }: Props) => {
  const { t } = useIntl()
  const { overlays, toggleOverlay, removeCustomOverlay } = useVisibleLayers()
  const checked = !!overlays[overlay.id]
  const checkboxId = useId()
  return (
    <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-slate-800">
      <label htmlFor={checkboxId} className="flex min-w-0 flex-1 items-center gap-2">
        <Checkbox
          id={checkboxId}
          checked={checked}
          onCheckedChange={() => toggleOverlay(overlay.id)}
        />
        <span className="truncate text-sm">{overlay.name}</span>
      </label>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onEdit(overlay)}
        aria-label={t('map.layerControl.customLayers.row.edit', undefined, 'Edit')}
      >
        <Pencil className="size-3" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => removeCustomOverlay(overlay.id)}
        aria-label={t('map.layerControl.customLayers.row.remove', undefined, 'Remove')}
      >
        <Trash2 className="size-3" aria-hidden="true" />
      </Button>
    </div>
  )
}
