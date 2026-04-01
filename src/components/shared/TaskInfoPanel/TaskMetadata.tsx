import { useNavigate } from '@tanstack/react-router'
import type { Challenge } from '@/types/Challenge'

interface MetadataLinkProps {
  label: string
  href: string
  children: React.ReactNode
  external?: boolean
  onNavigate?: () => void
}

const MetadataLink = ({ label, href, children, external, onNavigate }: MetadataLinkProps) => (
  <div className="text-xs text-zinc-500 dark:text-zinc-400">
    <span className="text-zinc-400 dark:text-zinc-500">{label}: </span>
    <a
      href={href}
      className="text-blue-600 hover:underline dark:text-blue-400"
      {...(external
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {
            onClick: (e: React.MouseEvent) => {
              e.preventDefault()
              onNavigate?.()
            },
          })}
    >
      {children}
    </a>
  </div>
)

interface TaskMetadataProps {
  taskName?: string | null
  challenge?: Challenge | null
  project?: { id?: number; name?: string; displayName?: string | null } | null
}

export const TaskMetadata = ({ taskName, challenge, project }: TaskMetadataProps) => {
  const navigate = useNavigate()

  return (
    <>
      {taskName && (
        <MetadataLink label="OSM ID" href={`https://openstreetmap.org/${taskName}`} external>
          {taskName}
        </MetadataLink>
      )}
      {challenge && (
        <MetadataLink
          label="Challenge"
          href={`/challenge/${challenge.id}`}
          onNavigate={() =>
            navigate({
              to: '/challenge/$challengeId',
              params: { challengeId: String(challenge.id) },
            })
          }
        >
          {challenge.name}
        </MetadataLink>
      )}
      {project && (
        <MetadataLink
          label="Project"
          href={`/project/${project.id}`}
          onNavigate={() =>
            navigate({
              to: '/project/$projectId',
              params: { projectId: String(project.id) },
            })
          }
        >
          {project.displayName ?? project.name}
        </MetadataLink>
      )}
    </>
  )
}
