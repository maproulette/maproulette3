import { Link } from '@tanstack/react-router'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'

interface ChallengeHeaderProps {
  name: string
  projectName?: string | null
  ownerName?: string
  formattedDate?: string | null
  isScrolled?: boolean
}

export const ChallengeHeader = ({
  name,
  projectName,
  ownerName,
  formattedDate,
  isScrolled = false,
}: ChallengeHeaderProps) => {
  const { projectId } = useBrowsedChallengeContext()

  return (
    <div className={`transition-all duration-500 ease-in-out ${isScrolled ? 'flex-1 min-w-0 mb-0' : 'w-full mb-6 space-y-2.5'}`}>
      <h1
        className={`font-bold text-zinc-900 leading-tight dark:text-zinc-50 transition-all duration-500 ease-in-out tracking-tight w-full min-w-0 ${
          isScrolled
            ? 'text-base truncate'
            : 'text-2xl line-clamp-2'
        }`}
      >
        {name}
      </h1>
      {!isScrolled && (
        <div className="overflow-hidden transition-all duration-500 ease-in-out max-h-20 opacity-100">
        {(projectName || ownerName || formattedDate) && (
          <div
            className="flex items-center gap-2.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
            onClick={(e) => e.stopPropagation()}
          >
          {projectName && projectId ? (
            <Link
              to="/project/$projectId"
              params={{ projectId: String(projectId) }}
              className="font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
              onClick={(e) => e.stopPropagation()}
            >
              {projectName}
            </Link>
          ) : projectName ? (
            <span className="font-medium">{projectName}</span>
          ) : null}
          {projectName && (ownerName || formattedDate) && (
            <span className="text-zinc-400 dark:text-zinc-500">•</span>
          )}
          {ownerName && (
            <span>
              by{' '}
              <a
                href={`https://www.openstreetmap.org/user/${encodeURIComponent(ownerName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
                onClick={(e) => e.stopPropagation()}
              >
                {ownerName}
              </a>
            </span>
          )}
          {ownerName && formattedDate && (
            <span className="text-zinc-400 dark:text-zinc-500">•</span>
          )}
          {formattedDate && <span>{formattedDate}</span>}
          </div>
        )}
        </div>
      )}
    </div>
  )
}
