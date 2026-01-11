import { Link } from '@tanstack/react-router'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'

interface ChallengeHeaderProps {
  name: string
  projectName?: string | null
  ownerName?: string
  formattedDate?: string | null
}

export const ChallengeHeader = ({
  name,
  projectName,
  ownerName,
  formattedDate,
}: ChallengeHeaderProps) => {
  const { projectId } = useBrowsedChallengeContext()

  return (
    <div className="mb-4 space-y-1">
      <h1 className="line-clamp-2 font-semibold text-xl text-zinc-900 leading-snug dark:text-zinc-50">
        {name}
      </h1>
      {projectName || ownerName || formattedDate ? (
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          {projectName && projectId ? (
            <Link
              to="/project/$projectId"
              params={{ projectId: String(projectId) }}
              className="font-medium transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              {projectName}
            </Link>
          ) : projectName ? (
            <span className="font-medium">{projectName}</span>
          ) : null}
          {projectName && (ownerName || formattedDate) && (
            <span className="text-zinc-500 dark:text-zinc-600">•</span>
          )}
          {ownerName && (
            <span>
              by{' '}
              <a
                href={`https://www.openstreetmap.org/user/${encodeURIComponent(ownerName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {ownerName}
              </a>
            </span>
          )}
          {ownerName && formattedDate && (
            <span className="text-zinc-500 dark:text-zinc-600">•</span>
          )}
          {formattedDate && <span>{formattedDate}</span>}
        </div>
      ) : null}
    </div>
  )
}
