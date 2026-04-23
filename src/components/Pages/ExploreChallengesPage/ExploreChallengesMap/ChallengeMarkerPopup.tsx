import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import maplibregl from 'maplibre-gl'
import { useEffect, useMemo, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { MapRef } from 'react-map-gl/maplibre'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useChallengeProgress } from '@/hooks/useChallengeProgress'
import { getDifficultyColor, getDifficultyLabel } from '@/lib/difficultyLevelData'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'

interface ChallengeMarkerPopupProps {
  mapRef: React.RefObject<MapRef | null>
  challenge: Challenge | null
  lngLat: { lng: number; lat: number } | null
  onClose: () => void
}

const PopupCard = ({ challenge, onClose }: { challenge: Challenge; onClose: () => void }) => {
  const { completionPercentage, segments } = useChallengeProgress(challenge.id)
  const tasksRemaining = challenge.completionMetrics?.tasksRemaining ?? 0
  const fallbackPercentage = challenge.completionPercentage || 0
  const pct = completionPercentage || fallbackPercentage
  const blurb = challenge.blurb || challenge.description || ''
  const truncatedBlurb = blurb.length > 140 ? `${blurb.slice(0, 137)}…` : blurb

  return (
    <div className="w-72 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 font-semibold text-sm text-zinc-900 leading-tight dark:text-white">
          {challenge.name}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close challenge popup"
          className="shrink-0 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {challenge.featured ? (
          <Badge
            variant="secondary"
            className="bg-violet-100 text-[10px] text-violet-800 dark:bg-violet-900/40 dark:text-violet-200"
          >
            Featured
          </Badge>
        ) : null}
        <Badge
          variant="outline"
          className={cn(getDifficultyColor(challenge.difficulty), 'text-[10px]')}
        >
          {getDifficultyLabel(challenge.difficulty)}
        </Badge>
      </div>

      {truncatedBlurb ? (
        <p className="mb-2 text-[11px] text-zinc-600 leading-snug dark:text-slate-300">
          {truncatedBlurb}
        </p>
      ) : null}

      <div className="mb-2">
        <div className="mb-1 text-[11px] text-zinc-500 dark:text-slate-300">
          <span className="font-semibold text-zinc-900 dark:text-white">{tasksRemaining}</span>{' '}
          tasks remaining
        </div>
        <ProgressBar
          segments={segments.length > 0 ? segments : undefined}
          percentage={segments.length > 0 ? undefined : pct}
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button asChild size="sm" variant="outline" className="h-7 px-2 text-[11px]">
          <Link to="/challenge/$challengeId" params={{ challengeId: challenge.id.toString() }}>
            Open
          </Link>
        </Button>
      </div>
    </div>
  )
}

export const ChallengeMarkerPopup = ({
  mapRef,
  challenge,
  lngLat,
  onClose,
}: ChallengeMarkerPopupProps) => {
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<Root | null>(null)

  // Memoized close handler so the popup dispatches identical callbacks for
  // both the X button and maplibre's own close event.
  const handleClose = useMemo(() => onClose, [onClose])

  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map || !challenge || !lngLat) {
      // Tear down any existing popup when the selection clears
      if (popupRef.current) {
        popupRef.current.remove()
        popupRef.current = null
      }
      if (rootRef.current) {
        // Defer unmount to avoid racing with React commit phase
        const root = rootRef.current
        rootRef.current = null
        queueMicrotask(() => {
          try {
            root.unmount()
          } catch (error) {
            logger.warn('Failed to unmount challenge popup root', { error: String(error) })
          }
        })
      }
      containerRef.current = null
      return
    }

    const container = document.createElement('div')
    container.className = 'mr4-challenge-marker-popup'
    containerRef.current = container

    const root = createRoot(container)
    rootRef.current = root
    root.render(<PopupCard challenge={challenge} onClose={handleClose} />)

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: 'none',
      offset: 12,
      className: 'mr4-challenge-popup',
    })
      .setLngLat([lngLat.lng, lngLat.lat])
      .setDOMContent(container)
      .addTo(map)

    popup.on('close', handleClose)
    popupRef.current = popup

    return () => {
      popup.off('close', handleClose)
      popup.remove()
      popupRef.current = null
      if (rootRef.current) {
        const toUnmount = rootRef.current
        rootRef.current = null
        queueMicrotask(() => {
          try {
            toUnmount.unmount()
          } catch (error) {
            logger.warn('Failed to unmount challenge popup root', { error: String(error) })
          }
        })
      }
      containerRef.current = null
    }
  }, [challenge, lngLat, mapRef, handleClose])

  return null
}
