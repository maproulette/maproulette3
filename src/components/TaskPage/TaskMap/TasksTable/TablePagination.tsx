import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  isLoading: boolean
  onPageSizeChange: (size: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
}

export const TablePagination = ({
  currentPage,
  totalPages,
  pageSize,
  isLoading,
  onPageSizeChange,
  onPreviousPage,
  onNextPage,
}: TablePaginationProps) => {
  return (
    <div className="flex items-center justify-between border-zinc-200 border-t bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600 dark:text-zinc-400">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onPreviousPage}
          disabled={currentPage === 0 || isLoading}
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onNextPage}
          disabled={currentPage >= totalPages - 1 || isLoading}
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
