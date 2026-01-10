import { FolderOpen, Hash } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '../../shared/EmptyState'
import { LoadingState } from '../../shared/LoadingState'
import { ResultCard } from '../../shared/ResultCard'
import { SectionDivider } from '../../shared/SectionDivider'
import { TextInputFilter } from '../../shared/TextInputFilter'

// Filler data for projects
const FILLER_PROJECTS = [
  {
    id: 201,
    name: 'Urban Infrastructure Mapping',
    description:
      'Comprehensive mapping of urban infrastructure including roads, utilities, and public facilities',
    owner: 'CityMapper Team',
    challenges: 24,
    enabled: true,
    featured: true,
    created: '2024-01-15',
    tags: ['infrastructure', 'urban', 'roads'],
  },
  {
    id: 202,
    name: 'Historic Buildings Documentation',
    description: 'Document and verify historic buildings and landmarks with proper tagging',
    owner: 'Heritage Mappers',
    challenges: 12,
    enabled: true,
    featured: false,
    created: '2024-03-20',
    tags: ['historic', 'buildings', 'heritage'],
  },
  {
    id: 203,
    name: 'Public Transport Network Update',
    description: 'Update and maintain public transportation routes, stops, and schedules',
    owner: 'Transit Team',
    challenges: 18,
    enabled: true,
    featured: true,
    created: '2024-02-10',
    tags: ['transport', 'public-transit', 'routes'],
  },
  {
    id: 204,
    name: 'Park and Recreation Mapping',
    description: 'Map parks, playgrounds, sports facilities and other recreational areas',
    owner: 'Green Mappers',
    challenges: 8,
    enabled: true,
    featured: false,
    created: '2024-04-05',
    tags: ['parks', 'recreation', 'nature'],
  },
  {
    id: 205,
    name: 'Emergency Services Access',
    description: 'Ensure accurate mapping for emergency service access points and routes',
    owner: 'Safety First',
    challenges: 15,
    enabled: false,
    featured: false,
    created: '2024-05-12',
    tags: ['emergency', 'safety', 'access'],
  },
]

interface FindProjectProps {
  searchQuery?: string
  onResultSelect: () => void
}

export const FindProject = ({ onResultSelect }: FindProjectProps) => {
  const [projectId, setProjectId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [isLoading] = useState(false)

  // Filter projects based on criteria
  const filteredProjects = FILLER_PROJECTS.filter((project) => {
    if (projectId && !project.id.toString().includes(projectId)) return false
    if (projectName && !project.name.toLowerCase().includes(projectName.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="space-y-3 border-zinc-200 border-b pb-4 dark:border-zinc-800">
        <div className="space-y-3">
          <TextInputFilter
            label="Project ID"
            value={projectId}
            onChange={setProjectId}
            placeholder="Enter project ID..."
            icon={Hash}
            type="number"
          />

          <TextInputFilter
            label="Project Name"
            value={projectName}
            onChange={setProjectName}
            placeholder="Search by name..."
            icon={FolderOpen}
          />
        </div>
      </div>

      <div>
        <SectionDivider label="Results" icon={FolderOpen} />

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <LoadingState message="Loading projects..." />
          ) : filteredProjects.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No projects found"
              description="Try adjusting your filters to see more results"
            />
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                </span>
              </div>
              {filteredProjects.map((project) => (
                <ResultCard
                  key={project.id}
                  title={project.name}
                  description={project.description}
                  href={`/browse/projects/${project.id}`}
                  onClick={onResultSelect}
                  badge={
                    project.featured
                      ? { variant: 'success', label: 'Featured' }
                      : project.enabled
                        ? { variant: 'info', label: 'Active' }
                        : { variant: 'default', label: 'Disabled' }
                  }
                  metadata={[
                    { label: 'Challenges', value: project.challenges },
                    { label: 'Owner', value: project.owner },
                    { label: 'Created', value: new Date(project.created).toLocaleDateString() },
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
