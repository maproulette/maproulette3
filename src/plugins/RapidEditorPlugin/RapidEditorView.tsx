/**
 * Rapid Editor View Component
 * Can be embedded in the TaskMap to provide direct OSM editing
 */

import { useEffect, useRef, useState } from 'react'
import { useTaskContext } from '../../components/TaskEditPage/contexts/TaskContext'
import { useTaskMapContext } from '../../components/TaskEditPage/contexts/TaskMapContext'
import { constructRapidURI } from './editorUtils'

interface RapidEditorViewProps {
  onClose?: () => void
}

/**
 * Get OSM token from auth context/local storage
 */
const getOSMToken = (): string | null => {
  return localStorage.getItem('osm_token') || null
}

export const RapidEditorView = ({ onClose }: RapidEditorViewProps) => {
  const { task } = useTaskContext()
  const { map } = useTaskMapContext()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const mapBounds = map.current
    ? (() => {
        const maplibreMap = map.current.getMap()
        const center = maplibreMap.getCenter()
        return {
          lat: center.lat,
          lng: center.lng,
          zoom: maplibreMap.getZoom(),
        }
      })()
    : undefined

  const initialHash = constructRapidURI(task, mapBounds, {
    comment: `MapRoulette Task #${task.id}`,
  })

  const token = getOSMToken()
  const osmApiServer = import.meta.env.VITE_OSM_API_SERVER || 'https://api.openstreetmap.org'

  let initialUrl = `/rapid-editor.html${initialHash}`

  if (osmApiServer === 'https://api.openstreetmap.org' && token) {
    initialUrl += `&token=${token}`
  }

  const handleResetHash = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.location.hash = initialHash
    }
  }

  const handleIframeLoad = async (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = event.target as HTMLIFrameElement

    try {
      // @ts-expect-error - setupRapid is added by the Rapid editor
      const context = await iframe.contentWindow?.setupRapid()

      if (context.systems?.editor) {
        context.systems.editor.on('stablechange', () => {
          const hasChanges = context.systems.editor.hasChanges()
          setHasUnsavedChanges(hasChanges)
        })
      }

      if (iframe.contentWindow) {
        iframe.contentWindow.location.hash = initialHash
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Failed to initialize Rapid editor:', err)
      setError(err as Error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes in the Rapid editor. Are you sure you want to close it?'
      )
      if (!confirmed) return
    }
    onClose?.()
  }

  return (
    <div className="relative size-full bg-white dark:bg-zinc-950">
      {/* Top Control Bar */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {hasUnsavedChanges && (
          <div className="flex items-center rounded bg-yellow-500 px-3 py-1.5 text-sm text-white shadow-md">
            Unsaved Changes
          </div>
        )}
        <button
          type="button"
          onClick={handleResetHash}
          className="rounded bg-purple-600 px-3 py-1.5 text-sm text-white shadow-md transition-colors hover:bg-purple-700"
          title="Reset view to task location"
        >
          Re-Select Task
        </button>
        {onClose && (
          <button
            type="button"
            onClick={handleClose}
            className="rounded bg-gray-600 px-3 py-1.5 text-sm text-white shadow-md transition-colors hover:bg-gray-700"
            title="Close Rapid Editor"
          >
            ✕ Close Editor
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
          <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-lg dark:border-red-800 dark:bg-zinc-900">
            <h2 className="mb-2 font-semibold text-red-800 text-xl dark:text-red-200">
              Error Loading Rapid Editor
            </h2>
            <p className="text-red-600 text-sm dark:text-red-300">{error.message}</p>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-zinc-950/80">
          <div className="text-center">
            <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
            <div className="text-gray-700 dark:text-gray-300">Loading Rapid Editor...</div>
          </div>
        </div>
      )}

      {/* Rapid Editor Iframe */}
      <iframe
        ref={iframeRef}
        className="size-full border-0"
        src={initialUrl}
        onLoad={handleIframeLoad}
        title="Rapid Editor"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  )
}
