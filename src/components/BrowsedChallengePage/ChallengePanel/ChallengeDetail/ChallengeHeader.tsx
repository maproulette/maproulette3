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
  return (
    <div className="mb-6 space-y-1.5">
      <h1 className="line-clamp-2 font-bold text-2xl text-zinc-900 leading-tight dark:text-zinc-50">
        {name}
      </h1>
      {projectName || ownerName || formattedDate ? (
        <div className="flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
          {projectName && <span className="font-medium">{projectName}</span>}
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
