import { ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { useAuthContext } from '@/contexts/AuthContext'
import { initials } from '@/lib/utils'

export const ProfilePage = () => {
  const { user } = useAuthContext()

  if (!user) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your profile</p>
      </div>
    )
  }

  const displayName = user.osmProfile.displayName
  const avatarURL = user.osmProfile.avatarURL
  const createdDate = new Date(user.created).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12">
      {/* Profile Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <Avatar className="mb-4 size-32">
          <AvatarImage src={avatarURL} alt={displayName} />
          <AvatarFallback className="font-semibold text-base">
            {initials(displayName)}
          </AvatarFallback>
        </Avatar>
        <h1 className="mb-2 font-bold text-base">{displayName}</h1>
        <p className="mb-4 text-muted-foreground">User since: {createdDate}</p>
        <div className="flex gap-4">
          <a
            href={`https://www.openstreetmap.org/user/${encodeURIComponent(displayName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            OSM Profile
            <ExternalLink className="size-4" />
          </a>
          <a
            href={`https://osmcha.org/users/${encodeURIComponent(displayName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            OSMCha
            <ExternalLink className="size-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
