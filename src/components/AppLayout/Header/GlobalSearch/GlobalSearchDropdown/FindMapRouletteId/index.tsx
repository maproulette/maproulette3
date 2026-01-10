import { ArrowRight, Hash, Search } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../../shared/EmptyState'
import { ResultCard } from '../../shared/ResultCard'
import { SectionDivider } from '../../shared/SectionDivider'
import { TextInputFilter } from '../../shared/TextInputFilter'

// Filler data mapping IDs to resources
const FILLER_ID_MAP = {
  201: { type: 'project', name: 'Urban Infrastructure Mapping', href: '/browse/projects/201' },
  202: { type: 'project', name: 'Historic Buildings Documentation', href: '/browse/projects/202' },
  203: { type: 'project', name: 'Public Transport Network Update', href: '/browse/projects/203' },

  101: { type: 'challenge', name: 'Missing Stop Signs Challenge', href: '/challenge/101' },
  102: { type: 'challenge', name: 'Street Name Corrections', href: '/challenge/102' },
  103: { type: 'challenge', name: 'Address Verification', href: '/challenge/103' },
  104: { type: 'challenge', name: 'Park Features Update', href: '/challenge/104' },
  105: { type: 'challenge', name: 'Highway Maintenance', href: '/challenge/105' },

  1001: {
    type: 'task',
    name: 'Add missing stop signs in downtown',
    href: '/challenge/101/task/1001',
  },
  1002: {
    type: 'task',
    name: 'Fix incorrect street name - Main St',
    href: '/challenge/102/task/1002',
  },
  1003: {
    type: 'task',
    name: 'Verify building addresses on Elm Street',
    href: '/challenge/103/task/1003',
  },
}

interface FindMapRouletteIdProps {
  searchQuery?: string
  onResultSelect: () => void
}

export const FindMapRouletteId = ({ onResultSelect }: FindMapRouletteIdProps) => {
  const [searchId, setSearchId] = useState('')
  const [resourceType, _setResourceType] = useState('all')

  const result = searchId ? FILLER_ID_MAP[Number(searchId) as keyof typeof FILLER_ID_MAP] : null
  const matchesFilter = !result || resourceType === 'all' || result.type === resourceType

  const getTypeBadge = (
    type: string
  ): { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string } => {
    switch (type) {
      case 'project':
        return { variant: 'info', label: 'Project' }
      case 'challenge':
        return { variant: 'warning', label: 'Challenge' }
      case 'task':
        return { variant: 'success', label: 'Task' }
      default:
        return { variant: 'default', label: type }
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Section */}
      <div className="space-y-3 border-zinc-200 border-b pb-4 dark:border-zinc-800">
        <div className="space-y-3">
          <TextInputFilter
            label="MapRoulette ID"
            value={searchId}
            onChange={setSearchId}
            placeholder="Enter ID (e.g., 101, 1001, 201)..."
            icon={Hash}
            type="number"
          />
        </div>
      </div>

      {/* Results Section */}
      <div>
        <SectionDivider label="Result" icon={Search} />

        <div className="mt-4 space-y-3">
          {!searchId ? (
            <EmptyState
              icon={Hash}
              title="Enter an ID to search"
              description="Type a MapRoulette ID above to find projects, challenges, or tasks"
            />
          ) : !result ? (
            <EmptyState
              icon={Search}
              title="No match found"
              description={`No resource found with ID: ${searchId}`}
            />
          ) : !matchesFilter ? (
            <EmptyState
              icon={Search}
              title="Type mismatch"
              description={`ID ${searchId} is a ${result.type}, but you're filtering for ${resourceType}`}
            />
          ) : (
            <div className="space-y-3">
              <ResultCard
                title={result.name}
                href={result.href}
                onClick={onResultSelect}
                badge={getTypeBadge(result.type)}
                metadata={[
                  { label: 'ID', value: searchId },
                  {
                    label: 'Type',
                    value: result.type.charAt(0).toUpperCase() + result.type.slice(1),
                  },
                ]}
              />

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-900/20">
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-emerald-600 p-1 dark:bg-emerald-500">
                    <ArrowRight className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-emerald-900 text-sm dark:text-emerald-100">
                      Click to navigate
                    </p>
                    <p className="mt-0.5 text-emerald-700 text-xs dark:text-emerald-300">
                      This will take you directly to the {result.type}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
