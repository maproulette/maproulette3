import { TableHead, TableHeader, TableRow } from '@/components/ui/Table'

interface TaskTableHeaderProps {
  allSelected: boolean
  onSelectAll: () => void
  hasDisplayedTasks: boolean
}

export const TaskTableHeader = ({
  allSelected,
  onSelectAll,
  hasDisplayedTasks,
}: TaskTableHeaderProps) => {
  return (
    <TableHeader className="sticky top-0 border-zinc-200 border-b bg-zinc-100 text-xs text-zinc-700 uppercase dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
      <TableRow>
        <TableHead className="w-12 px-4 py-3">
          <input
            type="checkbox"
            checked={hasDisplayedTasks && allSelected}
            onChange={onSelectAll}
            className="h-4 w-4 rounded border-zinc-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-700"
          />
        </TableHead>
        <TableHead className="w-12 px-4 py-3"></TableHead>
        <TableHead className="px-4 py-3">ID</TableHead>
        <TableHead className="px-4 py-3">Status</TableHead>
        <TableHead className="px-4 py-3">Priority</TableHead>
        <TableHead className="px-4 py-3">Location</TableHead>
        <TableHead className="w-12 px-4 py-3"></TableHead>
      </TableRow>
    </TableHeader>
  )
}
