import { Link } from '@tanstack/react-router'
import { Copy, Eye, FolderOpen, MoreHorizontal, Pin, Play } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { api } from '@/api'
import { useBrowsedProjectContext } from '@/components/Pages/BrowsedProjectPage/contexts/BrowsedProjectContext'
import {
  buildPropertiesWithPinnedChallenges,
  getPinnedChallengeIds,
} from '@/components/Pages/ManagementPages/ManageProjects/pinnedProjects'
import { ChallengeCard } from '@/components/shared/ChallengeCard'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Label } from '@/components/ui/Label'
import { ScrollArea } from '@/components/ui/ScrollArea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'

export const ChallengesList = () => {
  const { project } = useBrowsedProjectContext()
  const [sortBy, setSortBy] = useState('name')
  const [workOn, setWorkOn] = useState('Anything')
  const [difficulty, setDifficulty] = useState('Any')
  const [categorize, setCategorize] = useState('Anything')
  const [displayAll, setDisplayAll] = useState(false)

  const { data: challenges = [] } = api.project.getProjectChallenges(project.id)

  const { user } = useAuthContext()
  const updateSettingsMutation = api.user.useUpdateUserSettings()
  // Reason: extracts pinned challenge IDs from user settings - avoids recomputing on every render
  const pinnedChallengeIds = useMemo(() => getPinnedChallengeIds(user), [user])

  // Reason: stable reference for pin toggle handler passed to each challenge card
  const toggleChallengePin = useCallback(
    (challengeId: number) => {
      if (!user?.id) return
      const next = pinnedChallengeIds.includes(challengeId)
        ? pinnedChallengeIds.filter((id) => id !== challengeId)
        : [...pinnedChallengeIds, challengeId]
      const properties = buildPropertiesWithPinnedChallenges(user, next)
      updateSettingsMutation.mutate({
        userId: user.id,
        settings: user.settings ?? {},
        properties,
      })
    },
    [user, pinnedChallengeIds, updateSettingsMutation]
  )

  const buildChallengeActions = (challenge: Challenge) => {
    const isPinned = challenge.id != null && pinnedChallengeIds.includes(challenge.id)
    const canStart = (challenge.tasksRemaining ?? 0) > 0
    return (
      <div className="flex items-center gap-1">
        {user && challenge.id != null && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              toggleChallengePin(challenge.id)
            }}
            title={isPinned ? 'Unpin challenge' : 'Pin challenge'}
            aria-label={isPinned ? 'Unpin challenge' : 'Pin challenge'}
          >
            <Pin
              className={cn(
                'h-4 w-4',
                isPinned
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-zinc-400 hover:text-zinc-600 dark:text-white0 dark:hover:text-slate-400'
              )}
            />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canStart && (
              <DropdownMenuItem asChild>
                <Link
                  to="/challenge/$challengeId"
                  params={{ challengeId: String(challenge.id) }}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start challenge
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link
                to="/challenge/$challengeId"
                params={{ challengeId: String(challenge.id) }}
                className="flex cursor-pointer items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View challenge
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const url = `${window.location.origin}/challenge/${challenge.id}`
                void navigator.clipboard.writeText(url)
              }}
              className="flex cursor-pointer items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy URL
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // Filter and sort challenges
  const filteredChallenges = [...challenges].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'created':
        return new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime()
      case 'modified':
        return new Date(b.modified || 0).getTime() - new Date(a.modified || 0).getTime()
      case 'popularity':
        return (b.completionPercentage || 0) - (a.completionPercentage || 0)
      default:
        return 0
    }
  })

  const displayedChallenges = displayAll
    ? filteredChallenges
    : filteredChallenges.filter((challenge) => {
        // Show challenges with remaining tasks
        const remaining = challenge.tasksRemaining || 0
        return remaining > 0
      })

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-zinc-200 border-b bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="font-bold text-base text-zinc-900 dark:text-white">Challenges</h2>
      </div>

      {/* Filters */}
      <div className="border-zinc-200 border-b bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="font-medium text-xs text-zinc-700 dark:text-slate-300">SORT BY</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-32 border-zinc-300 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Default</SelectItem>
                <SelectItem value="created">Newest</SelectItem>
                <SelectItem value="modified">Oldest</SelectItem>
                <SelectItem value="popularity">Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="font-medium text-xs text-zinc-700 dark:text-slate-300">WORK ON</Label>
            <Select value={workOn} onValueChange={setWorkOn}>
              <SelectTrigger className="h-8 w-40 border-zinc-300 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Anything">Anything</SelectItem>
                <SelectItem value="Roads">Roads / Pedestrian / Cycleways</SelectItem>
                <SelectItem value="Water">Water</SelectItem>
                <SelectItem value="Points">Points / Areas of Interest</SelectItem>
                <SelectItem value="Buildings">Buildings</SelectItem>
                <SelectItem value="Land Use">Land Use / Administrative Boundaries</SelectItem>
                <SelectItem value="Transit">Transit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="font-medium text-xs text-zinc-700 dark:text-slate-300">
              DIFFICULTY
            </Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="h-8 w-28 border-zinc-300 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any">Any</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="font-medium text-xs text-zinc-700 dark:text-slate-300">
              CATEGORIZE
            </Label>
            <Select value={categorize} onValueChange={setCategorize}>
              <SelectTrigger className="h-8 w-32 border-zinc-300 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Anything">Anything</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Challenges Count and Toggle */}
      <div className="border-zinc-200 border-b bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-zinc-700 dark:text-slate-300">
            {displayedChallenges.length} CHALLENGES REMAINING IN PROJECT
          </span>
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={displayAll}
              onChange={(e) => setDisplayAll(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700"
            />
            Display All Challenges
          </label>
        </div>
      </div>

      {/* Challenges List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {displayedChallenges.length === 0 ? (
            <div className="py-6 text-center">
              <FolderOpen className="mx-auto mb-2 h-12 w-12 text-zinc-400" />
              <p className="text-sm text-zinc-500 dark:text-slate-400">No challenges found</p>
            </div>
          ) : (
            displayedChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                actions={buildChallengeActions(challenge)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
