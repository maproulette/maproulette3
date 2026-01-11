import { Loader2 } from 'lucide-react'

export interface ChunkLoadingIndicatorProps {
  chunksLoaded: number
  totalChunks: number
  isVisible: boolean
  message?: string
}

export const ChunkLoadingIndicator = ({
  chunksLoaded,
  totalChunks,
  isVisible,
  message = 'Rendering task markers...',
}: ChunkLoadingIndicatorProps) => {
  if (!isVisible) return null

  const progress = totalChunks > 0 ? (chunksLoaded / totalChunks) * 100 : 0

  return (
    <div className="pointer-events-none absolute inset-0 z-[9999] flex items-center justify-center bg-white/20 backdrop-blur-sm">
      <div className="min-w-[280px] rounded-xl border border-zinc-200 bg-zinc-900/95 px-6 py-4 shadow-2xl dark:border-zinc-800">
        <div className="mb-3 flex items-center gap-3">
          <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
          <span className="font-medium text-sm text-white">{message}</span>
        </div>
        <div className="ml-7.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-zinc-300">
              Chunk {chunksLoaded} of {totalChunks}
            </span>
            <span className="font-medium text-xs text-zinc-200">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
