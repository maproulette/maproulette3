import { useNavigate } from '@tanstack/react-router'
import type { Challenge } from '@/types/Challenge'

interface TaskMetadataProps {
  taskName?: string | null
  challenge?: Challenge | null
  project?: { id?: number; name?: string; displayName?: string | null } | null
}

export const TaskMetadata = ({ taskName, challenge, project }: TaskMetadataProps) => {
  const navigate = useNavigate()

  return (
    <>
      {/* OSM ID */}
      {taskName && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500">OSM ID: </span>
          <a
            href={`https://openstreetmap.org/${taskName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {taskName}
          </a>
        </div>
      )}

      {/* Challenge name */}
      {challenge && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500">Challenge: </span>
          <a
            href={`/challenge/${challenge.id}`}
            onClick={(e) => {
              e.preventDefault()
              navigate({
                to: '/challenge/$challengeId',
                params: { challengeId: String(challenge.id) },
              })
            }}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {challenge.name}
          </a>
        </div>
      )}

      {/* Project name */}
      {project && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500">Project: </span>
          <a
            href={`/project/${project.id}`}
            onClick={(e) => {
              e.preventDefault()
              navigate({
                to: '/project/$projectId',
                params: { projectId: String(project.id) },
              })
            }}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {project.displayName ?? project.name}
          </a>
        </div>
      )}
    </>
  )
}
