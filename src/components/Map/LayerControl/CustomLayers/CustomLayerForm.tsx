import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useVisibleLayers } from '@/contexts/VisibleLayersContext'
import type { CustomOverlay } from '@/types/MapLayer'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  existing?: CustomOverlay
}

export const CustomLayerForm = ({ open, onOpenChange, existing }: Props) => {
  const { addCustomOverlay, updateCustomOverlay } = useVisibleLayers()
  const [name, setName] = useState(existing?.name ?? '')
  const [url, setUrl] = useState(existing?.url ?? '')
  const [type, setType] = useState<CustomOverlay['type']>(existing?.type ?? 'tile')
  const [attribution, setAttribution] = useState(existing?.attribution ?? '')
  const nameId = useId()
  const typeId = useId()
  const urlId = useId()
  const attrId = useId()

  const handleSubmit = () => {
    if (!name.trim() || !url.trim()) return
    const payload = {
      name,
      url,
      type,
      attribution: attribution || undefined,
      scope: 'user' as const,
    }
    if (existing) updateCustomOverlay(existing.id, payload)
    else addCustomOverlay(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit layer' : 'Add custom layer'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor={nameId}>Name</Label>
            <Input id={nameId} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={typeId}>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as CustomOverlay['type'])}>
              <SelectTrigger id={typeId}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tile">Tile (XYZ)</SelectItem>
                <SelectItem value="wms">WMS</SelectItem>
                <SelectItem value="geojson">GeoJSON URL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={urlId}>URL template</Label>
            <Input
              id={urlId}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…/{z}/{x}/{y}.png"
            />
          </div>
          <div>
            <Label htmlFor={attrId}>Attribution</Label>
            <Input
              id={attrId}
              value={attribution}
              onChange={(e) => setAttribution(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !url.trim()}>
            {existing ? 'Save' : 'Add layer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
