import {
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Eye,
  EyeOff,
  Map as MapIcon,
  MousePointerClick,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/api'
import {
  calculateGeometryBounds,
  parseTaskLocation,
} from '@/components/TaskInfoPanel/taskUtils/geometryUtils'
import { parseOsmFeaturesFromTask } from '@/components/TaskInfoPanel/taskUtils/osmUtils'
import { logger } from '@/lib/logger'
import { getOSMToken } from '@/plugins/RapidEditorPlugin/editorUtils'
import { getIdGlobal, type IdContext, type IdGlobal, type IdIframeWindow } from '@/types/iDEditor'
import type { Bbox2D } from '@/types/Map'
import type { Task } from '@/types/Task'
import { useEditorContext } from './contexts/EditorContext'
import { useTaskBundleContext } from './contexts/TaskBundleContext'
import { useTaskContext } from './contexts/TaskContext'
import { useTaskMapContext } from './contexts/TaskMapContext'

/** Filter entity IDs to only those currently loaded in the iD context, then enter modeSelect. */
const selectValidEntities = (
  ctx: IdContext,
  iDGlobal: IdGlobal | undefined,
  entityIds: string[]
) => {
  if (!iDGlobal?.modeSelect) return
  const validIds = entityIds.filter((id) => {
    try {
      return !!ctx.hasEntity(id)
    } catch {
      return false
    }
  })
  if (validIds.length > 0) {
    ctx.enter(iDGlobal.modeSelect(ctx, validIds))
  }
}

interface IdEditorViewProps {
  onClose: () => void
  onUnmount: () => void
}

export const IdEditorView = ({ onClose, onUnmount }: IdEditorViewProps) => {
  const { task } = useTaskContext()
  const { activeBundle } = useTaskBundleContext()
  const { map } = useTaskMapContext()
  const {
    idUnsavedCount,
    setIdUnsavedCount,
    idViewportRef,
    highlightIdEntityRef,
    taskToOsmIdRef,
    selectIdEntitiesRef,
  } = useEditorContext()
  const [isLoading, setIsLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const idContextRef = useRef<IdContext | null>(null)
  const osmEntityIdsRef = useRef<string[]>([])
  const [focusMode, setFocusMode] = useState(false)

  const hasUnsavedChanges = idUnsavedCount > 0

  const bundledTaskIds = useMemo(
    () => activeBundle?.taskIds.filter((id) => id !== task.id) ?? [],

    [activeBundle?.taskIds.length, task.id]
  )
  const { data: bundledTasks } = api.task.getTasks(bundledTaskIds)

  const { osmEntityIds, taskBounds } = useMemo(() => {
    const allTasks: Task[] = [task, ...(bundledTasks ?? [])]
    const ids: string[] = []
    const mapping: Record<number, string> = {}
    let west = Infinity
    let south = Infinity
    let east = -Infinity
    let north = -Infinity

    for (const t of allTasks) {
      const features = parseOsmFeaturesFromTask(t)
      for (const feature of features) {
        const prefix = feature.type === 'node' ? 'n' : feature.type === 'way' ? 'w' : 'r'
        const entityId = `${prefix}${feature.id}`
        ids.push(entityId)
        // First feature wins for the per-task highlight mapping
        if (!(t.id in mapping)) mapping[t.id] = entityId
      }
      const b = calculateGeometryBounds(t)
      if (b) {
        if (b[0] < west) west = b[0]
        if (b[1] < south) south = b[1]
        if (b[2] > east) east = b[2]
        if (b[3] > north) north = b[3]
      }
    }
    taskToOsmIdRef.current = mapping
    const combinedBounds: Bbox2D | null = Number.isFinite(west) ? [west, south, east, north] : null
    return { osmEntityIds: ids, taskBounds: combinedBounds }
  }, [task.id, bundledTasks])

  osmEntityIdsRef.current = osmEntityIds

  const position = useMemo(() => {
    if (map.current) {
      const maplibreMap = map.current.getMap()
      const center = maplibreMap.getCenter()
      return { lat: center.lat, lng: center.lng, zoom: maplibreMap.getZoom() }
    }

    const loc = parseTaskLocation(task)
    if (loc) return { ...loc, zoom: 18 }

    return { lat: 0, lng: 0, zoom: 2 }
  }, [task.id])

  const buildHash = useCallback(() => {
    const params = new URLSearchParams()
    params.set('map', `${position.zoom}/${position.lat}/${position.lng}`)
    params.set('comment', `MapRoulette Task #${task.id}`)
    if (task.id) params.set('maproulette_task', task.id.toString())
    if (osmEntityIds.length > 0) params.set('id', osmEntityIds.join(','))

    const token = getOSMToken()
    const osmApiServer = import.meta.env.VITE_OSM_API_SERVER || 'https://api.openstreetmap.org'
    if (osmApiServer === 'https://api.openstreetmap.org' && token) {
      params.set('token', token)
    }

    return `#${params.toString()}`
  }, [position, task.id, osmEntityIds])

  const initialUrl = useMemo(() => `/id-editor.html?v=2${buildHash()}`, [buildHash])

  const handleResetView = () => {
    const ctx = idContextRef.current
    if (!ctx?.map || !taskBounds) return
    const [west, south, east, north] = taskBounds
    try {
      const lngPad = (east - west) * 0.3 || 0.002
      const latPad = (north - south) * 0.3 || 0.002
      const padded: [[number, number], [number, number]] = [
        [west - lngPad, south - latPad],
        [east + lngPad, north + latPad],
      ]
      ctx.map().extent(padded)
    } catch {
      ctx.map().centerZoom([(west + east) / 2, (south + north) / 2], 17)
    }
  }

  const handleToggleFocusMode = () => {
    const newMode = !focusMode
    setFocusMode(newMode)
    try {
      const iframeDoc = iframeRef.current?.contentDocument
      const surface = idContextRef.current?.surface() ?? null
      if (iframeDoc && surface) {
        const mapContainer = iframeDoc.querySelector('.ideditor')
        if (mapContainer) {
          mapContainer.classList.toggle('mr-focus-mode', newMode)
        }

        if (newMode) {
          for (const id of osmEntityIdsRef.current) {
            surface.selectAll(`.${id}`).classed('mr-task', true)
          }
        }
      }
    } catch {}
  }

  const handleIframeLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = event.target as HTMLIFrameElement

    try {
      const win = iframe.contentWindow as IdIframeWindow | null
      const context = win?.setupiD?.()
      if (!context) {
        logger.error('iD editor setupiD() returned no context')
        setIsLoading(false)
        return
      }
      idContextRef.current = context

      try {
        const iframeDoc = iframe.contentDocument
        if (iframeDoc) {
          const style = iframeDoc.createElement('style')
          style.id = 'mr-custom-styles'
          style.textContent = `
            .mr-active .shadow { stroke: #a855f7 !important; stroke-opacity: 0.95 !important; }
            .mr-active .stroke { stroke: #a855f7 !important; stroke-opacity: 0.9 !important; }

            .mr-focus-mode .layer-osm path,
            .mr-focus-mode .layer-osm circle,
            .mr-focus-mode .layer-osm text,
            .mr-focus-mode .layer-osm use,
            .mr-focus-mode .layer-osm image {
              opacity: 0.08 !important;
            }
            .mr-focus-mode .layer-osm .mr-task,
            .mr-focus-mode .layer-osm .mr-task *,
            .mr-focus-mode .layer-osm .highlighted,
            .mr-focus-mode .layer-osm .highlighted *,
            .mr-focus-mode .layer-osm .selected,
            .mr-focus-mode .layer-osm .selected *,
            .mr-focus-mode .layer-osm .mr-active,
            .mr-focus-mode .layer-osm .mr-active * {
              opacity: 1 !important;
            }
          `
          iframeDoc.head.appendChild(style)
        }
      } catch {}

      const iDGlobalForHighlight = getIdGlobal(iframe.contentWindow)
      let prevHighlightId: string | null = null
      highlightIdEntityRef.current = (osmEntityId: string | null) => {
        const surface = context.surface()
        if (!surface || !iDGlobalForHighlight?.utilHighlightEntities) return

        if (prevHighlightId) {
          iDGlobalForHighlight.utilHighlightEntities([prevHighlightId], false, context)
          surface.selectAll(`.${prevHighlightId}`).classed('mr-active', false)
        }

        if (osmEntityId && context.hasEntity(osmEntityId)) {
          iDGlobalForHighlight.utilHighlightEntities([osmEntityId], true, context)
          surface.selectAll(`.${osmEntityId}`).classed('mr-active', true)
        }
        prevHighlightId = osmEntityId
      }

      selectIdEntitiesRef.current = (osmEntityIds: string[]) => {
        try {
          selectValidEntities(context, iDGlobalForHighlight, osmEntityIds)
        } catch (e) {
          logger.error('[iD] selectIdEntities error', { error: e })
        }
      }

      if (context?.history) {
        context.history().on('change.maproulette', () => {
          const changes = context.history().changes()
          const count = changes.modified.length + changes.created.length + changes.deleted.length
          setIdUnsavedCount(count)
        })
      }

      if (context?.map) {
        context.map().on('move.maproulette', () => {
          const center = context.map().center()
          const zoom = context.map().zoom()
          idViewportRef.current = { lat: center[1], lng: center[0], zoom }
        })
      }

      setTimeout(() => {
        const ids = osmEntityIdsRef.current
        if (!context || ids.length === 0) return
        try {
          const iDGlobal = getIdGlobal(iframe.contentWindow)
          selectValidEntities(context, iDGlobal, ids)
        } catch (e) {
          logger.error('[iD] initial select error', { error: e })
        }
      }, 2000)

      setIsLoading(false)
    } catch (err) {
      logger.error('Failed to initialize iD editor', { error: err })
      setIsLoading(false)
    }
  }

  const initialTaskIdRef = useRef(task.id)
  useEffect(() => {
    if (task.id === initialTaskIdRef.current) return
    const ctx = idContextRef.current
    if (!ctx?.map) return

    const loc = parseTaskLocation(task)
    if (loc) {
      ctx.map().centerZoom([loc.lng, loc.lat], 18)
    }

    try {
      ctx.defaultChangesetComment(`MapRoulette Task #${task.id}`)
    } catch {}

    const retrySelect = (attemptsLeft: number) => {
      const ids = osmEntityIdsRef.current
      if (ids.length === 0 || attemptsLeft <= 0) return
      const iDGlobal = getIdGlobal(iframeRef.current?.contentWindow)
      const validIds = ids.filter((id) => {
        try {
          return !!ctx.hasEntity(id)
        } catch {
          return false
        }
      })
      if (validIds.length > 0) {
        selectValidEntities(ctx, iDGlobal, validIds)

        if (focusMode) {
          try {
            const surface = ctx.surface?.()
            if (surface) {
              for (const id of validIds) {
                surface.selectAll(`.${id}`).classed('mr-task', true)
              }
            }
          } catch {}
        }
      } else {
        setTimeout(() => retrySelect(attemptsLeft - 1), 500)
      }
    }
    setTimeout(() => retrySelect(6), 1000)
  }, [task.id])

  useEffect(() => {
    return () => {
      const context = idContextRef.current
      if (!context) return
      try {
        context.history?.().on('change.maproulette', null)
        context.map?.().on('move.maproulette', null)
      } catch {}
    }
  }, [])

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

  const handleUnmount = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes in the iD editor. Are you sure you want to close it?'
      )
      if (!confirmed) return
    }
    onUnmount()
  }

  return (
    <div className="relative size-full bg-white dark:bg-slate-950">
      {/* MapRoulette toolbar — attached to bottom of iD nav */}
      <div className="absolute top-[70px] right-0 z-10 flex items-start">
        {/* Toggle + logo tab (always visible) */}
        <button
          type="button"
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="flex h-10 items-center gap-1.5 rounded-bl-lg bg-slate-900/95 pr-2.5 pl-2 shadow-md transition-colors hover:bg-slate-800"
          title={drawerOpen ? 'Collapse panel' : 'Expand panel'}
        >
          {drawerOpen ? (
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
          )}
          <img src="/logo192.png" alt="MapRoulette" className="h-5 w-5" />
        </button>

        {/* Collapsible drawer content */}
        <div
          className={`flex items-center overflow-hidden transition-all duration-200 ${drawerOpen ? 'max-w-[600px] opacity-100' : 'max-w-0 opacity-0'}`}
        >
          <div className="flex items-center gap-1 bg-slate-900/95 py-1.5 pr-2 pl-1 shadow-md">
            {/* Unsaved changes */}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1.5 rounded-md bg-yellow-500/90 px-2.5 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                <span className="whitespace-nowrap font-semibold text-[11px] text-white">
                  {idUnsavedCount} unsaved change{idUnsavedCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <button
              type="button"
              onClick={handleResetView}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 font-medium text-[11px] text-slate-300 transition-colors hover:bg-slate-700/80 hover:text-white"
              title="Reset view to task location"
            >
              <Crosshair className="h-4 w-4" />
              Re-Center
            </button>
            {osmEntityIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const ctx = idContextRef.current
                  const iDGlobal = getIdGlobal(iframeRef.current?.contentWindow)
                  if (!ctx || !iDGlobal) return
                  selectValidEntities(ctx, iDGlobal, osmEntityIdsRef.current)
                }}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 font-medium text-[11px] text-slate-300 transition-colors hover:bg-slate-700/80 hover:text-white"
                title="Select task features in iD"
              >
                <MousePointerClick className="h-4 w-4" />
                Select Tasks
              </button>
            )}
            <button
              type="button"
              onClick={handleToggleFocusMode}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 font-medium text-[11px] transition-colors ${
                focusMode
                  ? 'bg-purple-600/80 text-white hover:bg-purple-500'
                  : 'text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
              title={focusMode ? 'Show all map features' : 'Dim other features to focus on tasks'}
            >
              {focusMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {focusMode ? 'Show All' : 'Focus'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 font-medium text-[11px] text-slate-300 transition-colors hover:bg-slate-700/80 hover:text-white"
              title="Show task map"
            >
              <MapIcon className="h-4 w-4" />
              Show Map
            </button>
            <button
              type="button"
              onClick={handleUnmount}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 font-medium text-[11px] text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
              title="Unmount iD Editor to free resources"
            >
              <Trash2 className="h-4 w-4" />
              Unmount
            </button>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-950/80">
          <div className="text-center">
            <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
            <div className="text-zinc-700 dark:text-zinc-300">Loading iD Editor...</div>
          </div>
        </div>
      )}

      {/* iD Editor Iframe — no sandbox because allow-same-origin + allow-scripts
          on a same-origin iframe negates sandboxing and triggers a browser warning */}
      <iframe
        ref={iframeRef}
        className="size-full border-0"
        src={initialUrl}
        onLoad={handleIframeLoad}
        title="iD Editor"
      />
    </div>
  )
}
