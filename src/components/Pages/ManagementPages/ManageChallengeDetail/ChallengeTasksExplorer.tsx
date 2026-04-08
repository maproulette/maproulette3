import { Link } from '@tanstack/react-router'
import { ArrowDownAZ, ArrowUp, ArrowUpAZ, ChevronDown } from 'lucide-react'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { api } from '@/api'
import { processMarkersData } from '@/components/Map/TaskMarkers/utils'
import { TASK_STATUS_LABELS } from '@/components/Pages/ManagementPages/taskStatusLabels'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/Resizable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { DEFAULT_PRIORITY_FILTER, DEFAULT_TASK_STATUS_FILTER } from '@/lib/challengeTaskTableSearch'
import type { TaskMarker } from '@/types/Task'
import { MiniChallengeMap } from './MiniChallengeMap'

const TASK_PRIORITY_LABELS: Record<number, string> = {
  0: 'High',
  1: 'Medium',
  2: 'Low',
}

const SORT_FIELDS = [
  { value: 'id', label: 'ID' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
] as const

type SortField = (typeof SORT_FIELDS)[number]['value']

const BATCH_SIZE = 50

const initialEnabledRecord = <T extends readonly number[]>(values: T): Record<number, boolean> => {
  return Object.fromEntries(values.map((v) => [v, true]))
}

type ViewportBounds = { west: number; south: number; east: number; north: number }

const parseBoundsString = (s: string): ViewportBounds | null => {
  const parts = s.split(',').map(Number)
  if (parts.length !== 4 || parts.some(Number.isNaN)) return null
  return { west: parts[0], south: parts[1], east: parts[2], north: parts[3] }
}

const markerInBounds = (m: TaskMarker, b: ViewportBounds): boolean => {
  const lng = m.location?.lng
  const lat = m.location?.lat
  if (lng == null || lat == null) return false
  return lng >= b.west && lng <= b.east && lat >= b.south && lat <= b.north
}

type ExplorerContextValue = {
  enabled: boolean
  challengeId: number
  statusEnabled: Record<number, boolean>
  setStatusChecked: (s: number, checked: boolean) => void
  priorityEnabled: Record<number, boolean>
  setPriorityChecked: (p: number, checked: boolean) => void
  sortField: SortField
  setSortField: (f: SortField) => void
  sortDesc: boolean
  setSortDesc: React.Dispatch<React.SetStateAction<boolean>>
  clearFilters: () => void
  filtersDirty: boolean
  markers: TaskMarker[]
  filteredMarkers: TaskMarker[]
  isLoading: boolean
  setViewportBounds: (bounds: string) => void
  selectedTask: TaskMarker | null
  setSelectedTask: (task: TaskMarker | null) => void
}

const ExplorerContext = createContext<ExplorerContextValue | null>(null)

const useExplorerContext = () => {
  const ctx = useContext(ExplorerContext)
  if (!ctx) {
    throw new Error('Challenge tasks explorer components must be used within the provider')
  }
  return ctx
}

export const ChallengeTasksExplorerProvider = ({
  challengeId,
  enabled,
  children,
}: {
  challengeId: number
  enabled: boolean
  children: ReactNode
}) => {
  const [statusEnabled, setStatusEnabled] = useState(() =>
    initialEnabledRecord(DEFAULT_TASK_STATUS_FILTER)
  )
  const [priorityEnabled, setPriorityEnabled] = useState(() =>
    initialEnabledRecord(DEFAULT_PRIORITY_FILTER)
  )
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortDesc, setSortDesc] = useState(true)
  const [viewportBounds, setViewportBoundsRaw] = useState<ViewportBounds | null>(null)
  const [selectedTask, setSelectedTask] = useState<TaskMarker | null>(null)

  const setViewportBounds = useCallback((boundsStr: string) => {
    setViewportBoundsRaw(parseBoundsString(boundsStr))
  }, [])

  const { data: taskMarkersData, isLoading } = api.challenge.getChallengeTaskMarkers(challengeId)

  const markers = useMemo(() => processMarkersData(taskMarkersData).markers, [taskMarkersData])

  const filteredMarkers = useMemo(() => {
    const filtered = markers
      .filter((m) => statusEnabled[m.status])
      .filter((m) => priorityEnabled[m.priority])
      .filter((m) => !viewportBounds || markerInBounds(m, viewportBounds))

    filtered.sort((a, b) => {
      let cmp = 0
      if (sortField === 'id') cmp = a.id - b.id
      else if (sortField === 'status') cmp = a.status - b.status
      else if (sortField === 'priority') cmp = a.priority - b.priority
      return sortDesc ? -cmp : cmp
    })

    return filtered
  }, [markers, statusEnabled, priorityEnabled, sortField, sortDesc, viewportBounds])

  const setStatusChecked = useCallback((s: number, checked: boolean) => {
    setStatusEnabled((prev) => {
      const countOn = DEFAULT_TASK_STATUS_FILTER.filter((x) => prev[x]).length
      if (!checked && countOn <= 1) return prev
      return { ...prev, [s]: checked }
    })
  }, [])

  const setPriorityChecked = useCallback((p: number, checked: boolean) => {
    setPriorityEnabled((prev) => {
      const countOn = DEFAULT_PRIORITY_FILTER.filter((x) => prev[x]).length
      if (!checked && countOn <= 1) return prev
      return { ...prev, [p]: checked }
    })
  }, [])

  const clearFilters = useCallback(() => {
    setStatusEnabled(initialEnabledRecord(DEFAULT_TASK_STATUS_FILTER))
    setPriorityEnabled(initialEnabledRecord(DEFAULT_PRIORITY_FILTER))
    setSortField('id')
    setSortDesc(true)
  }, [])

  const filtersDirty =
    DEFAULT_TASK_STATUS_FILTER.some((s) => !statusEnabled[s]) ||
    DEFAULT_PRIORITY_FILTER.some((p) => !priorityEnabled[p]) ||
    sortField !== 'id' ||
    sortDesc !== true

  const value = useMemo(
    (): ExplorerContextValue => ({
      enabled,
      challengeId,
      statusEnabled,
      setStatusChecked,
      priorityEnabled,
      setPriorityChecked,
      sortField,
      setSortField,
      sortDesc,
      setSortDesc,
      clearFilters,
      filtersDirty,
      markers,
      filteredMarkers,
      isLoading,
      setViewportBounds,
      selectedTask,
      setSelectedTask,
    }),
    [
      enabled,
      challengeId,
      statusEnabled,
      priorityEnabled,
      sortField,
      sortDesc,
      clearFilters,
      filtersDirty,
      markers,
      filteredMarkers,
      isLoading,
      setStatusChecked,
      setPriorityChecked,
      setViewportBounds,
      selectedTask,
    ]
  )

  return <ExplorerContext.Provider value={value}>{children}</ExplorerContext.Provider>
}

/** Task table filter options for the sidebar. */
export const ChallengeTasksExplorerSidebar = () => {
  const {
    enabled,
    statusEnabled,
    setStatusChecked,
    priorityEnabled,
    setPriorityChecked,
    sortField,
    setSortField,
    sortDesc,
    setSortDesc,
    clearFilters,
    filtersDirty,
  } = useExplorerContext()

  if (!enabled) {
    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 font-medium text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
          Filters
        </p>
        <div className="flex flex-col gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between gap-1">
                <span>
                  Status
                  {DEFAULT_TASK_STATUS_FILTER.some((s) => !statusEnabled[s]) ? (
                    <span className="text-amber-600"> ·</span>
                  ) : null}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-72 w-56 overflow-y-auto" align="start">
              <DropdownMenuLabel>Task status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {DEFAULT_TASK_STATUS_FILTER.map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={statusEnabled[s]}
                  onCheckedChange={(c) => setStatusChecked(s, c === true)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {TASK_STATUS_LABELS[s]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between gap-1">
                <span>
                  Priority
                  {DEFAULT_PRIORITY_FILTER.some((p) => !priorityEnabled[p]) ? (
                    <span className="text-amber-600"> ·</span>
                  ) : null}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {DEFAULT_PRIORITY_FILTER.map((p) => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={priorityEnabled[p]}
                  onCheckedChange={(c) => setPriorityChecked(p, c === true)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {TASK_PRIORITY_LABELS[p]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={!filtersDirty}
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-2 font-medium text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
          Sort
        </p>
        <div className="flex flex-col gap-2">
          <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_FIELDS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1"
            onClick={() => setSortDesc((d) => !d)}
            title={sortDesc ? 'Descending' : 'Ascending'}
          >
            {sortDesc ? (
              <>
                <ArrowDownAZ className="h-4 w-4" />
                Descending
              </>
            ) : (
              <>
                <ArrowUpAZ className="h-4 w-4" />
                Ascending
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Map and infinite-scroll task table. */
export const ChallengeTasksExplorerMain = () => {
  const {
    enabled,
    challengeId,
    filteredMarkers,
    isLoading,
    setViewportBounds,
    selectedTask,
    setSelectedTask,
  } = useExplorerContext()

  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Reset visible count when filtered data changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE)
  }, [filteredMarkers])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && visibleCount < filteredMarkers.length) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredMarkers.length))
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [visibleCount, filteredMarkers.length])

  // Show scroll-to-top button when map is scrolled out of view
  useEffect(() => {
    const top = topRef.current
    if (!top) return

    const observer = new IntersectionObserver(
      (entries) => {
        setShowScrollTop(!entries[0]?.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(top)
    return () => observer.disconnect()
  }, [])

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const visibleMarkers = filteredMarkers.slice(0, visibleCount)

  const statusLabel = (s: number) => TASK_STATUS_LABELS[s] ?? `Status ${s}`
  const priorityLabel = (p: number) => TASK_PRIORITY_LABELS[p] ?? String(p)

  if (!enabled) {
    return null
  }

  return (
    <div className="relative h-full">
      <div ref={topRef} />
      <ResizablePanelGroup direction="vertical" className="h-full" style={{ overflow: 'visible' }}>
        <ResizablePanel defaultSize={50} minSize={20} style={{ overflow: 'visible' }}>
          <div className="relative h-full">
            <MiniChallengeMap
              challengeId={challengeId}
              containerClassName="h-full w-full rounded-lg border border-zinc-200 dark:border-slate-700"
              onBoundsStringChange={setViewportBounds}
              selectedTask={selectedTask}
              onSelectTask={setSelectedTask}
            />
            <div className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-0 z-20">
              <div className="flex h-14 w-4 items-center justify-center rounded-full bg-white shadow-md dark:bg-slate-200">
                <div className="grid grid-cols-2 gap-[3px]">
                  <div className="h-1 w-1 rounded-full bg-zinc-500" />
                  <div className="h-1 w-1 rounded-full bg-zinc-500" />
                  <div className="h-1 w-1 rounded-full bg-zinc-500" />
                  <div className="h-1 w-1 rounded-full bg-zinc-500" />
                  <div className="h-1 w-1 rounded-full bg-zinc-500" />
                  <div className="h-1 w-1 rounded-full bg-zinc-500" />
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={15}>
          <div className="flex h-full flex-col">
            <div className="shrink-0 pb-2 text-sm text-zinc-600 dark:text-zinc-400">
              {isLoading
                ? 'Loading tasks…'
                : `Showing ${visibleMarkers.length} of ${filteredMarkers.length} tasks`}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-zinc-200 dark:border-slate-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[44px]" />
                    <TableHead className="w-[88px]">ID</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[100px]">Priority</TableHead>
                    <TableHead className="w-[88px]">Bundle</TableHead>
                    <TableHead className="w-[140px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleMarkers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                        No tasks match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleMarkers.map((marker) => {
                      const isSelected = selectedTask?.id === marker.id
                      return (
                        <TableRow
                          key={marker.id}
                          className={isSelected ? 'bg-purple-50 dark:bg-purple-950/30' : undefined}
                        >
                          <TableCell className="px-2">
                            <button
                              type="button"
                              onClick={() => setSelectedTask(isSelected ? null : marker)}
                              className="flex h-5 w-5 items-center justify-center"
                              aria-label={isSelected ? 'Deselect task' : 'Select task'}
                            >
                              <span
                                className={`block h-3.5 w-3.5 rounded-full border-2 transition-colors ${
                                  isSelected
                                    ? 'border-purple-500 bg-purple-500'
                                    : 'border-zinc-400 dark:border-zinc-600'
                                }`}
                              >
                                {isSelected && (
                                  <span className="block h-full w-full rounded-full border-2 border-white dark:border-zinc-950" />
                                )}
                              </span>
                            </button>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{marker.id}</TableCell>
                          <TableCell className="text-sm">{statusLabel(marker.status)}</TableCell>
                          <TableCell className="text-sm">
                            {priorityLabel(marker.priority)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {marker.bundleId != null ? marker.bundleId : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                                <Link
                                  to="/manage/task/$taskId"
                                  params={{ taskId: String(marker.id) }}
                                >
                                  View
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 px-2" asChild>
                                <Link
                                  to="/manage/task/$taskId/edit"
                                  params={{ taskId: String(marker.id) }}
                                >
                                  Edit
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
              {/* Infinite scroll sentinel */}
              {visibleCount < filteredMarkers.length && <div ref={sentinelRef} className="h-1" />}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed right-6 bottom-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-white shadow-lg transition-opacity hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
