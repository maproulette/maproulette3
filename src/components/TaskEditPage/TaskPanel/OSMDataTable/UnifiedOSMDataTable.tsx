import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { OSMArea, OSMNode, OSMWay } from './parseOSMForTable'

interface UnifiedOSMItem {
  id: string
  type: 'node' | 'way' | 'area'
  lat?: number
  lon?: number
  nodeCount?: number
  tags: Record<string, string>
}

interface UnifiedOSMDataTableProps {
  nodes: OSMNode[]
  ways: OSMWay[]
  areas: OSMArea[]
  isLoading?: boolean
  onRowHover?: (item: UnifiedOSMItem | null) => void
}

export const UnifiedOSMDataTable = ({
  nodes,
  ways,
  areas,
  isLoading = false,
  onRowHover,
}: UnifiedOSMDataTableProps) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)

  // Combine all data into a unified list
  const allData = useMemo<UnifiedOSMItem[]>(() => {
    const items: UnifiedOSMItem[] = []

    nodes.forEach((node) => {
      items.push({
        id: node.id,
        type: 'node',
        lat: node.lat,
        lon: node.lon,
        tags: node.tags,
      })
    })

    ways.forEach((way) => {
      items.push({
        id: way.id,
        type: 'way',
        nodeCount: way.nodeIds.length,
        tags: way.tags,
      })
    })

    areas.forEach((area) => {
      items.push({
        id: area.id,
        type: 'area',
        nodeCount: area.nodeIds.length,
        tags: area.tags,
      })
    })

    return items
  }, [nodes, ways, areas])

  const totalPages = Math.ceil(allData.length / pageSize)
  const startIndex = currentPage * pageSize
  const endIndex = Math.min(startIndex + pageSize, allData.length)
  const paginatedData = useMemo(
    () => allData.slice(startIndex, endIndex),
    [allData, startIndex, endIndex]
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

  const getTypeBadgeColor = (type: 'node' | 'way' | 'area') => {
    switch (type) {
      case 'node':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'way':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'area':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    }
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-zinc-200 border-b bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">OSM Data</h3>
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-medium text-xs dark:bg-zinc-800">
            {isLoading
              ? 'Loading...'
              : allData.length > 0
                ? `${startIndex + 1}-${endIndex} of ${allData.length}`
                : '0 items'}
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 border-zinc-200 border-b bg-zinc-100 text-xs text-zinc-700 uppercase dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  Loading OSM data...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No OSM data in visible area
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={`${item.type}-${item.id}`}
                  onMouseEnter={() => onRowHover?.(item)}
                  onMouseLeave={() => onRowHover?.(null)}
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 font-medium text-xs ${getTypeBadgeColor(item.type)}`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium font-mono text-xs">
                    {item.id}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    {item.type === 'node' ? (
                      <>
                        {item.lat?.toFixed(6)}, {item.lon?.toFixed(6)}
                      </>
                    ) : (
                      <>{item.nodeCount} nodes</>
                    )}
                  </td>
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
