import { useSearchContext } from '../../SearchContextProvider'

export const StatusFilter = () => {
  const { searchParams, setSearchParams } = useSearchContext()

  const statusOptions = [
    { value: 0, label: 'Created', color: '#959DFF' },
    { value: 1, label: 'Fixed', color: '#65D2DA' },
    { value: 2, label: 'False Positive', color: '#F7BB59' },
    { value: 3, label: 'Skipped', color: '#E87CE0' },
    { value: 4, label: 'Deleted', color: '#737373' },
    { value: 5, label: 'Already Fixed', color: '#CCB186' },
    { value: 6, label: 'Too Hard', color: '#FF5E63' },
  ]

  const toggleStatusFilter = (status: number) => {
    const isCurrentlySelected = searchParams.statuses.includes(status)
    setSearchParams({
      ...searchParams,
      statuses: isCurrentlySelected
        ? searchParams.statuses.filter((s) => s !== status)
        : [...searchParams.statuses, status],
    })
  }

  return (
    <div className="absolute top-4 left-4 bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-3 z-20 max-w-xs">
      <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
        Task Status Filter
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {statusOptions.map((status) => (
          <label key={status.value} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchParams.statuses.includes(status.value)}
              onChange={() => toggleStatusFilter(status.value)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div
              className="w-3 h-3 rounded-full border border-white"
              style={{ backgroundColor: status.color }}
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">{status.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
