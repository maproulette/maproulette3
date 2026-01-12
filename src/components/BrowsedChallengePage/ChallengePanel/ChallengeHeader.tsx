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
    <div
      className={`transition-all duration-500 ease-in-out ${isScrolled ? 'mb-0 min-w-0 flex-1' : 'mb-6 w-full space-y-2.5'}`}
    >
      <h1
        className={`w-full min-w-0 font-bold text-zinc-900 leading-tight tracking-tight transition-all duration-500 ease-in-out dark:text-zinc-50 ${
          isScrolled ? 'truncate text-base' : 'line-clamp-2 text-2xl'
        }`}
      >
        {name}
      </h1>
      {!isScrolled && (
        <div className="max-h-20 overflow-hidden opacity-100 transition-all duration-500 ease-in-out">
          {(projectName || ownerName || formattedDate) && (
            // biome-ignore lint/a11y/noStaticElementInteractions: Event handlers only stop propagation, element is not interactive
            <div
              className="flex items-center gap-2.5 font-medium text-xs text-zinc-600 dark:text-zinc-400"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                }
              }}
              role="presentation"
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
