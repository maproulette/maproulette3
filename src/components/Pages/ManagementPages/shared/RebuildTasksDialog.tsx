import { CircleAlert } from 'lucide-react'
import { useId, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
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
import type { Challenge } from '@/types/Challenge'

type SourceType = 'local' | 'remote' | 'overpass'

const REBUILD_DOCS_URL = 'https://learn.maproulette.org/documentation/rebuilding-challenge-tasks/'

// Infer a challenge's task source from which field is populated, falling back
// to a local upload — mirrors the detection used by the challenge form.
export const getChallengeSourceType = (challenge?: Challenge): SourceType => {
  if (challenge?.overpassQL) return 'overpass'
  if (challenge?.remoteGeoJson) return 'remote'
  return 'local'
}

// A line-by-line GeoJSON file holds one JSON object per line rather than a
// single JSON document, so the whole file won't parse but its first line will.
const detectLineByLine = (text: string): boolean => {
  const trimmed = text.trim()
  try {
    JSON.parse(trimmed)
    return false
  } catch {
    const firstLine = trimmed.split('\n').find((line) => line.trim().length > 0)
    if (!firstLine) return false
    try {
      JSON.parse(firstLine)
      return true
    } catch {
      return false
    }
  }
}

const sourceIntro: Record<SourceType, string> = {
  overpass:
    'Rebuilding will re-run the Overpass query and rebuild the challenge tasks with the latest data:',
  remote:
    "Rebuilding will re-download the GeoJSON data from the challenge's remote URL and rebuild the challenge tasks with the latest data:",
  local:
    'Rebuilding will allow you to upload a new local file with the latest GeoJSON data and rebuild the challenge tasks:',
}

interface Props {
  challengeId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceType?: SourceType
}

export const RebuildTasksDialog = ({ challengeId, open, onOpenChange, sourceType }: Props) => {
  const [removeUnmatched, setRemoveUnmatched] = useState(false)
  const [localFile, setLocalFile] = useState<File | null>(null)
  const [dataOriginDate, setDataOriginDate] = useState('')

  const rebuild = api.challenge.useRebuildChallenge()
  const uploadGeoJSON = api.challenge.useUploadGeoJSON()
  const unmatchedId = useId()
  const fileId = useId()
  const dateId = useId()

  const isLocal = sourceType === 'local'
  const isPending = rebuild.isPending || uploadGeoJSON.isPending
  const canSubmit = !isPending && (!isLocal || localFile !== null)

  const reset = () => {
    setLocalFile(null)
    setDataOriginDate('')
    setRemoveUnmatched(false)
  }

  const handleSubmit = async () => {
    try {
      if (isLocal) {
        if (!localFile) return
        const text = await localFile.text()
        await uploadGeoJSON.mutateAsync({
          challengeId,
          geoJSONFile: localFile,
          options: {
            lineByLine: detectLineByLine(text),
            removeUnmatched,
            dataOriginDate: dataOriginDate ? new Date(dataOriginDate).toISOString() : undefined,
            skipSnapshot: true,
          },
        })
      } else {
        await rebuild.mutateAsync({ challengeId, removeUnmatched, skipSnapshot: true })
      }
      toast.success('Rebuild started')
      reset()
      onOpenChange(false)
    } catch (error) {
      logger.error('Rebuild failed', { error: String(error) })
      toast.error('Could not start rebuild')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rebuild Challenge Tasks</DialogTitle>
          <DialogDescription>
            {sourceType
              ? sourceIntro[sourceType]
              : 'Rebuild the challenge tasks from its source data.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            <li>Existing tasks included in the latest data will be updated</li>
            <li>New tasks will be added</li>
            <li>
              If you choose to first remove incomplete tasks (below), existing{' '}
              <strong>incomplete</strong> tasks will first be removed
            </li>
            <li>
              If you do not first remove incomplete tasks, they will be left as-is, possibly leaving
              tasks that have already been addressed outside of MapRoulette
            </li>
          </ul>

          <div className="flex items-start gap-3 rounded-lg bg-zinc-100 p-4 dark:bg-slate-800">
            <CircleAlert className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />
            <div className="space-y-2 text-amber-600 text-sm dark:text-amber-500">
              <p>
                Warning: Rebuilding can lead to task duplication if your feature ids are not setup
                properly or if matching up old data with new data is unsuccessful. This operation
                cannot be undone!
              </p>
              <a
                href={REBUILD_DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-green-600 underline hover:text-green-700 dark:text-green-400"
              >
                Learn More
              </a>
            </div>
          </div>

          {isLocal && (
            <div className="space-y-2">
              <Label htmlFor={fileId}>New GeoJSON file</Label>
              <Input
                id={fileId}
                type="file"
                accept=".geojson,.json"
                onChange={(e) => setLocalFile(e.target.files?.[0] ?? null)}
              />
              <Label htmlFor={dateId}>Date data was sourced (optional)</Label>
              <Input
                id={dateId}
                type="date"
                value={dataOriginDate}
                onChange={(e) => setDataOriginDate(e.target.value)}
              />
            </div>
          )}

          <label htmlFor={unmatchedId} className="flex items-center gap-2 text-sm">
            <Checkbox
              id={unmatchedId}
              checked={removeUnmatched}
              onCheckedChange={(c) => setRemoveUnmatched(c === true)}
            />
            First remove incomplete tasks
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={!canSubmit}>
            {isPending ? 'Rebuilding…' : 'Proceed'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
