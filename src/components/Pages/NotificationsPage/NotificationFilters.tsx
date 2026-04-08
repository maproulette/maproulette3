import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import type { useNotificationFilters } from '@/hooks/useNotificationFilters'
import { NOTIFICATION_TYPE_NAMES } from '@/types/Notification'

type FilterState = ReturnType<typeof useNotificationFilters>

interface NotificationFiltersProps {
  filters: FilterState
}

export const NotificationFilters = ({ filters }: NotificationFiltersProps) => {
  const {
    filterTask,
    setFilterTask,
    filterType,
    setFilterType,
    filterFrom,
    setFilterFrom,
    filterChallenge,
    setFilterChallenge,
    hasActiveFilters,
    clearFilters,
    filterOptions,
  } = filters

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <Select value={filterTask} onValueChange={setFilterTask}>
        <SelectTrigger className="h-9 w-[140px]">
          <SelectValue placeholder="Task" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tasks</SelectItem>
          {filterOptions.tasks.map((taskId: number) => (
            <SelectItem key={taskId} value={taskId.toString()}>
              Task #{taskId}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {filterOptions.types.map((typeId: number) => (
            <SelectItem key={typeId} value={typeId.toString()}>
              {NOTIFICATION_TYPE_NAMES[typeId] || `Type ${typeId}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterFrom} onValueChange={setFilterFrom}>
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue placeholder="From" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Senders</SelectItem>
          {filterOptions.fromUsers.map((username: string) => (
            <SelectItem key={username} value={username}>
              {username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterChallenge} onValueChange={setFilterChallenge}>
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="Challenge" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Challenges</SelectItem>
          {filterOptions.challenges.map((challengeName: string) => (
            <SelectItem key={challengeName} value={challengeName}>
              {challengeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300"
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}
