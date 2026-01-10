import { FileText, Search } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../../shared/EmptyState'
import { LoadingState } from '../../shared/LoadingState'
import { ResultCard } from '../../shared/ResultCard'
import { SectionDivider } from '../../shared/SectionDivider'
import { TextInputFilter } from '../../shared/TextInputFilter'

// Filler data for searchable features
const FILLER_FEATURES = [
  {
    id: 'f1',
    name: 'Main Street',
    type: 'highway',
    category: 'road',
    description: 'Primary road through downtown area',
    tags: ['road', 'primary', 'downtown'],
    lastUpdated: '2024-10-28',
  },
  {
    id: 'f2',
    name: 'Central Park',
    type: 'park',
    category: 'leisure',
    description: 'Large public park with recreational facilities',
    tags: ['park', 'recreation', 'nature'],
    lastUpdated: '2024-10-25',
  },
  {
    id: 'f3',
    name: 'City Library',
    type: 'library',
    category: 'amenity',
    description: 'Public library serving the downtown district',
    tags: ['library', 'public', 'amenity'],
    lastUpdated: '2024-10-20',
  },
  {
    id: 'f4',
    name: 'Transit Station',
    type: 'station',
    category: 'public_transport',
    description: 'Main public transit hub',
    tags: ['transit', 'public-transport', 'station'],
    lastUpdated: '2024-10-27',
  },
  {
    id: 'f5',
    name: 'River Bridge',
    type: 'bridge',
    category: 'infrastructure',
    description: 'Historic bridge crossing the main river',
    tags: ['bridge', 'historic', 'infrastructure'],
    lastUpdated: '2024-10-22',
  },
  {
    id: 'f6',
    name: 'Memorial Square',
    type: 'square',
    category: 'place',
    description: 'Historic town square and gathering place',
    tags: ['square', 'historic', 'landmark'],
    lastUpdated: '2024-10-15',
  },
]

interface FindFeatureByNameProps {
  searchQuery?: string
  onResultSelect: () => void
}

export const FindFeatureByName = ({ onResultSelect }: FindFeatureByNameProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading] = useState(false)

  // Filter features based on criteria
  const filteredFeatures = FILLER_FEATURES.filter((feature) => {
    if (searchTerm && !feature.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const getCategoryBadge = (
    category: string
  ): { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string } => {
    switch (category) {
      case 'road':
        return { variant: 'info', label: 'Road' }
      case 'leisure':
        return { variant: 'success', label: 'Leisure' }
      case 'amenity':
        return { variant: 'warning', label: 'Amenity' }
      case 'public_transport':
        return { variant: 'info', label: 'Transit' }
      case 'infrastructure':
        return { variant: 'default', label: 'Infrastructure' }
      case 'place':
        return { variant: 'warning', label: 'Place' }
      default:
        return { variant: 'default', label: category }
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="space-y-3 border-zinc-200 border-b pb-4 dark:border-zinc-800">
        <div className="space-y-3">
          <TextInputFilter
            label="Feature Name"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name..."
            icon={FileText}
          />
        </div>
      </div>

      {/* Results Section */}
      <div>
        <SectionDivider label="Results" icon={Search} />

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <LoadingState message="Searching features..." />
          ) : filteredFeatures.length === 0 ? (
            <EmptyState
              icon={Search}
              title={searchTerm ? 'No features found' : 'Start searching'}
              description={
                searchTerm
                  ? 'Try adjusting your search or filters'
                  : 'Enter a feature name to search'
              }
            />
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {filteredFeatures.length} feature{filteredFeatures.length !== 1 ? 's' : ''}
                </span>
              </div>
              {filteredFeatures.map((feature) => (
                <ResultCard
                  key={feature.id}
                  title={feature.name}
                  description={feature.description}
                  href={`/feature/${feature.id}`}
                  onClick={onResultSelect}
                  badge={getCategoryBadge(feature.category)}
                  metadata={[
                    { label: 'Type', value: feature.type },
                    {
                      label: 'Updated',
                      value: new Date(feature.lastUpdated).toLocaleDateString(),
                    },
                  ]}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
