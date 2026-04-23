import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { PRIORITY_COLOR, PRIORITY_LABEL, PRIORITY_TIERS } from '@/types/Priority'
import { useTaskPreview } from '../TaskPreviewContext'
import { PreviewDiffBadge } from './PreviewDiffBadge'

export const PreviewSummary = () => {
  const { preview, markers } = useTaskPreview()

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-slate-100">Preview summary</h3>
        <PreviewDiffBadge />
      </div>
      <p className="mb-3 text-xs text-zinc-500 dark:text-slate-400">
        Showing {markers.length.toLocaleString()} tasks. Bounds are evaluated client-side; property
        rules will be applied server-side on save.
      </p>
      <div className="flex flex-wrap gap-2">
        {PRIORITY_TIERS.map((p) => (
          <div
            key={p}
            className="flex items-center gap-2 rounded-md bg-zinc-50 px-2.5 py-1.5 dark:bg-slate-800"
          >
            <span className={cn('size-2.5 rounded-full', PRIORITY_COLOR[p].bg)} />
            <span className="text-xs text-zinc-700 dark:text-slate-200">{PRIORITY_LABEL[p]}</span>
            <span className="font-mono text-xs text-zinc-900 dark:text-slate-100">
              {preview.counts[p].toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      {preview.warnings.global.length > 0 && (
        <ul className="mt-3 space-y-1">
          {preview.warnings.global.map((w) => (
            <li key={w.kind}>
              <Badge
                variant="outline"
                className="gap-1.5 text-amber-700 dark:text-amber-400"
                aria-label={w.kind}
              >
                <AlertTriangle className="size-3" />
                {w.message}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
