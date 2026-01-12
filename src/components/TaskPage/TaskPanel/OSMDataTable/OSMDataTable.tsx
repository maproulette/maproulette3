import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { OSMArea, OSMNode, OSMWay } from './parseOSMForTable'

interface OSMDataTableProps<T extends OSMNode | OSMWay | OSMArea> {
  data: T[]
  type: 'nodes' | 'ways' | 'areas'
  isLoading?: boolean
  onRowHover?: (item: T | null) => void
}

export const OSMDataTable = <T extends OSMNode | OSMWay | OSMArea>({
  data,
  type,
  isLoading = false,
  onRowHover,
}: OSMDataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)

  const totalPages = Math.ceil(data.length / pageSize)
  const startIndex = currentPage * pageSize
  const endIndex = Math.min(startIndex + pageSize, data.length)
  const paginatedData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex]
  )

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(0)
  }

  const getTagsDisplay = (tags: Record<string, string>) => {
    const entries = Object.entries(tags)
    if (entries.length === 0) return 'No tags'
    return entries
      .slice(0, 3)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ')
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-zinc-200 border-b bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm capitalize">{type}</h3>
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-medium text-xs dark:bg-zinc-800">
            {isLoading
              ? 'Loading...'
              : data.length > 0
                ? `${startIndex + 1}-${endIndex} of ${data.length}`
                : '0 items'}
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 border-zinc-200 border-b bg-zinc-100 text-xs text-zinc-700 uppercase dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
              <th className="px-4 py-3">ID</th>
              {type === 'nodes' && (
                <>
                  <th className="px-4 py-3">Latitude</th>
                  <th className="px-4 py-3">Longitude</th>
                </>
              )}
              {(type === 'ways' || type === 'areas') && <th className="px-4 py-3">Nodes</th>}
              <th className="px-4 py-3">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isLoading ? (
              <tr>
                <td
                  colSpan={type === 'nodes' ? 4 : 3}
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  Loading {type}...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={type === 'nodes' ? 4 : 3}
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  No {type} in visible area
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  onMouseEnter={() => onRowHover?.(item)}
                  onMouseLeave={() => onRowHover?.(null)}
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium font-mono text-xs">
                    {item.id}
                  </td>
                  {type === 'nodes' && (
                    <>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {(item as OSMNode).lat.toFixed(6)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {(item as OSMNode).lon.toFixed(6)}
                      </td>
                    </>
                  )}
                  {(type === 'ways' || type === 'areas') && (
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {(item as OSMWay | OSMArea).nodeIds.length} nodes
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="max-w-md truncate text-xs text-zinc-600 dark:text-zinc-400">
                      {getTagsDisplay(item.tags)}
                      {Object.keys(item.tags).length > 3 && (
                        <span className="ml-1 text-zinc-400">
                          (+{Object.keys(item.tags).length - 3} more)
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex shrink-0 items-center justify-between border-zinc-200 border-t bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
            onClick={handlePreviousPage}
            disabled={currentPage === 0 || isLoading}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1 || isLoading}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
