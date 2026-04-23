import { FileUp, Upload } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { useSnapshotsContext } from './SnapshotsContext'

export const ImportSnapshotsDialog = () => {
  const { importDialogOpen, setImportDialogOpen, challengeId } = useSnapshotsContext()
  const importMutation = api.admin.useImportSnapshots()

  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  const reset = () => {
    setFile(null)
    setIsDragging(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!file) return
    try {
      await importMutation.mutateAsync({ challengeId, file })
      toast.success('Snapshots imported')
      reset()
      setImportDialogOpen(false)
    } catch (error) {
      logger.error('Import snapshots failed', { error, challengeId })
      toast.error('Could not import snapshots. The import endpoint may not be available yet.')
      throw error
    }
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) setFile(dropped)
  }

  return (
    <Dialog
      open={importDialogOpen}
      onOpenChange={(open) => {
        if (!open) reset()
        setImportDialogOpen(open)
      }}
    >
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Import snapshots</DialogTitle>
          <DialogDescription>
            Upload a CSV exported from this challenge (or a compatible MapRoulette export) to
            restore historical snapshot data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/** biome-ignore lint/a11y/noStaticElementInteractions: drag-drop target is standard UX */}
          {/** biome-ignore lint/a11y/useKeyWithClickEvents: click delegates to the file input below */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
              isDragging
                ? 'border-zinc-500 bg-zinc-50 dark:border-slate-400 dark:bg-slate-800/60'
                : 'border-zinc-300 dark:border-slate-700'
            )}
          >
            <FileUp className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {file ? file.name : 'Drag and drop a CSV, or click to browse'}
            </p>
            {file && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>

          <Label htmlFor={inputId} className="sr-only">
            Snapshot CSV
          </Label>
          <Input
            id={inputId}
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(false)}
            disabled={importMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || importMutation.isPending}>
            <Upload className="h-4 w-4" />
            {importMutation.isPending ? 'Importing…' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
