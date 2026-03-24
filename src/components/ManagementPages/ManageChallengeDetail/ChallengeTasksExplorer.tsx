import { Link } from '@tanstack/react-router'
import { ArrowDownAZ, ArrowUpAZ, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import type { Task, TasksBoundingBoxQuery } from '@/types/Task'
import {
  CHALLENGE_TASK_SORT_FIELDS,
  type ChallengeTaskSortField,
  DEFAULT_META_REVIEW_STATUS_FILTER,
  DEFAULT_PRIORITY_FILTER,
  DEFAULT_REVIEW_STATUS_FILTER,
  DEFAULT_TASK_STATUS_FILTER,
} from '@/utils/challengeTaskTableSearch'
import { TASK_STATUS_LABELS } from '@/utils/taskStatusLabels'
import { MiniChallengeMap } from './MiniChallengeMap'

const TASK_PRIORITY_LABELS: Record<number, string> = {
  0: 'High',
  1: 'Medium',
  2: 'Low',
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

const TABLE_SKELETON_ROW_KEYS = ['r1', 'r2', 'r3', 'r4', 'r5'] as const
const TABLE_SKELETON_COL_KEYS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'] as const

const WORLD_BOUNDS = [-180, -90, 180, 90] as const

function parseBoundsString(bounds: string): [number, number, number, number] | null {
  const coords = bounds.split(',').map((x) => Number.parseFloat(x.trim()))
  if (coords.length !== 4 || coords.some((n) => Number.isNaN(n))) {
    return null
  }
  return [coords[0], coords[1], coords[2], coords[3]]
}

function initialEnabledRecord<T extends readonly number[]>(values: T): Record<number, boolean> {
  return Object.fromEntries(values.map((v) => [v, true]))
}

type ExplorerContextValue = {
  enabled: boolean
  challengeId: number
  viewportBounds: string | null
  setViewportBounds: (v: string | null) => void
  limitToViewport: boolean
  setLimitToViewport: (v: boolean) => void
  pageSize: number
  setPageSize: (n: number) => void
  statusEnabled: Record<number, boolean>
  setStatusChecked: (s: number, checked: boolean) => void
  priorityEnabled: Record<number, boolean>
  setPriorityChecked: (p: number, checked: boolean) => void
  sortField: ChallengeTaskSortField
  setSortField: (f: ChallengeTaskSortField) => void
  sortDesc: boolean
  setSortDesc: React.Dispatch<React.SetStateAction<boolean>>
  clearFilters: () => void
  filtersDirty: boolean
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  queryEnabled: boolean
  tasks: Task[]
  total: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
  isLoading: boolean
  isFetching: boolean
  hasData: boolean
  viewportCheckboxId: string
}

const ExplorerContext = createContext<ExplorerContextValue | null>(null)

function useExplorerContext() {
  const ctx = useContext(ExplorerContext)
  if (!ctx) {
    throw new Error('Challenge tasks explorer components must be used within the provider')
  }
  return ctx
}

export function ChallengeTasksExplorerProvider({
  challengeId,
  enabled,
  children,
}: {
  challengeId: number
  enabled: boolean
  children: ReactNode
}) {
  const viewportCheckboxId = useId()
  const [viewportBounds, setViewportBounds] = useState<string | null>(null)
  const [limitToViewport, setLimitToViewport] = useState(true)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const [statusEnabled, setStatusEnabled] = useState(() =>
    initialEnabledRecord(DEFAULT_TASK_STATUS_FILTER)
  )
  const [priorityEnabled, setPriorityEnabled] = useState(() =>
    initialEnabledRecord(DEFAULT_PRIORITY_FILTER)
  )

  const [sortField, setSortField] = useState<ChallengeTaskSortField>('name')
  const [sortDesc, setSortDesc] = useState(true)

  const boxCoords = useMemo((): [number, number, number, number] | null => {
    if (!enabled) return null
    if (limitToViewport) {
      if (!viewportBounds) return null
      return parseBoundsString(viewportBounds)
    }
    return [...WORLD_BOUNDS]
  }, [enabled, limitToViewport, viewportBounds])

  const boundingQuery: TasksBoundingBoxQuery | null = useMemo(() => {
    if (!enabled || !boxCoords) return null
    const [left, bottom, right, top] = boxCoords
    return {
      left,
      bottom,
      right,
      top,
      challengeId,
      page,
      limit: pageSize,
      sort: sortField,
      order: sortDesc ? 'DESC' : 'ASC',
      taskStatuses: DEFAULT_TASK_STATUS_FILTER.filter((s) => statusEnabled[s]),
      priorities: DEFAULT_PRIORITY_FILTER.filter((p) => priorityEnabled[p]),
      reviewStatuses: [...DEFAULT_REVIEW_STATUS_FILTER],
      metaReviewStatuses: [...DEFAULT_META_REVIEW_STATUS_FILTER],
    }
  }, [
    enabled,
    boxCoords,
    challengeId,
    page,
    pageSize,
    sortField,
    sortDesc,
    statusEnabled,
    priorityEnabled,
  ])

  const queryEnabled = Boolean(boundingQuery)

  const { data, isLoading, isFetching } = api.task.getTasksInBoundingBox(
    boundingQuery ?? {
      left: 0,
      bottom: 0,
      right: 0,
      top: 0,
      challengeId,
      page: 0,
      limit: pageSize,
      sort: 'name',
      order: 'DESC',
      taskStatuses: [...DEFAULT_TASK_STATUS_FILTER],
      priorities: [...DEFAULT_PRIORITY_FILTER],
      reviewStatuses: [...DEFAULT_REVIEW_STATUS_FILTER],
      metaReviewStatuses: [...DEFAULT_META_REVIEW_STATUS_FILTER],
    },
    { enabled: queryEnabled }
  )

  useEffect(() => {
    setPage(0)
  }, [boxCoords, limitToViewport, pageSize, statusEnabled, priorityEnabled, sortField, sortDesc])

  const tasks = data?.tasks ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const rangeStart = total === 0 ? 0 : page * pageSize + 1
  const rangeEnd = Math.min((page + 1) * pageSize, total)

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
    setSortField('name')
    setSortDesc(true)
  }, [])

  const filtersDirty =
    DEFAULT_TASK_STATUS_FILTER.some((s) => !statusEnabled[s]) ||
    DEFAULT_PRIORITY_FILTER.some((p) => !priorityEnabled[p]) ||
    sortField !== 'name' ||
    sortDesc !== true

  const value = useMemo(
    (): ExplorerContextValue => ({
      enabled,
      challengeId,
      viewportBounds,
      setViewportBounds,
      limitToViewport,
      setLimitToViewport,
      pageSize,
      setPageSize,
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
      page,
      setPage,
      queryEnabled,
      tasks,
      total,
      totalPages,
      rangeStart,
      rangeEnd,
      isLoading,
      isFetching,
      hasData: Boolean(data),
      viewportCheckboxId,
    }),
    [
      enabled,
      challengeId,
      viewportBounds,
      limitToViewport,
      pageSize,
      statusEnabled,
      priorityEnabled,
      sortField,
      sortDesc,
      clearFilters,
      filtersDirty,
      page,
      queryEnabled,
      tasks,
      total,
      totalPages,
      rangeStart,
      rangeEnd,
      isLoading,
      isFetching,
      data,
      viewportCheckboxId,
      setStatusChecked,
      setPriorityChecked,
    ]
  )

  return <ExplorerContext.Provider value={value}>{children}</ExplorerContext.Provider>
}

/** Task table options for the sidebar (General information card). */
export function ChallengeTasksExplorerSidebar() {
  const {
    enabled,
    limitToViewport,
    setLimitToViewport,
    pageSize,
    setPageSize,
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
    viewportCheckboxId,
  } = useExplorerContext()

  if (!enabled) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 font-medium text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
          Task list
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id={viewportCheckboxId}
              checked={limitToViewport}
              onCheckedChange={(v) => setLimitToViewport(v === true)}
            />
            <Label htmlFor={viewportCheckboxId} className="cursor-pointer font-normal text-sm">
              Match map viewport
            </Label>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Rows per page</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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
          <Select
            value={sortField}
            onValueChange={(v) => setSortField(v as ChallengeTaskSortField)}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHALLENGE_TASK_SORT_FIELDS.map((opt) => (
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

/** Map, pagination, and table — minimal chrome, map first. */
export function ChallengeTasksExplorerMain() {
  const {
    enabled,
    challengeId,
    setViewportBounds,
    queryEnabled,
    page,
    setPage,
    tasks,
    total,
    totalPages,
    rangeStart,
    rangeEnd,
    isLoading,
    isFetching,
    hasData,
  } = useExplorerContext()

  const showTableSkeleton = !enabled || !queryEnabled || (isLoading && !hasData)

  const formatMappedOn = (t: (typeof tasks)[number]) => {
    if (t.mappedOn == null) return '—'
    return new Date(t.mappedOn).toLocaleString()
  }

  const statusLabel = (s: number | null | undefined) =>
    TASK_STATUS_LABELS[s ?? 0] ?? `Status ${s ?? '—'}`

  const priorityLabel = (p: number) => TASK_PRIORITY_LABELS[p] ?? String(p)

  if (!enabled) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[min(50vh,520px)] min-h-[240px] w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <MiniChallengeMap
        challengeId={challengeId}
        containerClassName="h-[min(50vh,520px)] min-h-[240px] w-full rounded-lg border border-zinc-200 dark:border-slate-700"
        onBoundsStringChange={setViewportBounds}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          {queryEnabled
            ? total === 0
              ? 'No tasks in this view'
              : `Showing ${rangeStart}–${rangeEnd} of ${total}`
            : 'Set map bounds…'}
          {isFetching && queryEnabled ? ' · Updating…' : null}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 0 || !queryEnabled}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-zinc-500 tabular-nums dark:text-zinc-400">
            Page {queryEnabled ? page + 1 : 0} / {queryEnabled ? totalPages : '—'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!queryEnabled || page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-slate-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[88px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[100px]">Priority</TableHead>
              <TableHead className="min-w-[160px]">Mapped</TableHead>
              <TableHead className="w-[88px]">Bundle</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showTableSkeleton ? (
              TABLE_SKELETON_ROW_KEYS.map((rowKey) => (
                <TableRow key={rowKey}>
                  {TABLE_SKELETON_COL_KEYS.map((colKey) => (
                    <TableCell key={`${rowKey}-${colKey}`}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                  No tasks match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-mono text-xs">{task.id}</TableCell>
                  <TableCell className="max-w-[240px] truncate font-medium">
                    {task.name || '—'}
                  </TableCell>
                  <TableCell className="text-sm">{statusLabel(task.status)}</TableCell>
                  <TableCell className="text-sm">{priorityLabel(task.priority)}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatMappedOn(task)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {task.bundleId != null ? task.bundleId : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                        <Link to="/manage/task/$taskId" params={{ taskId: String(task.id) }}>
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2" asChild>
                        <Link to="/manage/task/$taskId/edit" params={{ taskId: String(task.id) }}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
