import { Link } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { cn, initials } from '@/lib/utils'
import type { TeamRole, TeamUser } from '@/types/Team'
import { TeamRoleLabel } from '@/types/Team'

interface Props {
  membership: TeamUser
}

const roleBadge: Record<TeamRole, string> = {
  0: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  2: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
}

export const TeamCard = ({ membership }: Props) => {
  const name = membership.name || `Team #${membership.teamId}`
  const role = membership.status as TeamRole
  return (
    <Link to="/teams/$teamId" params={{ teamId: String(membership.teamId) }} className="block">
      <Card className="flex items-center gap-3 p-4 transition-shadow hover:shadow-md">
        <Avatar className="size-10">
          <AvatarImage src="" alt={name} />
          <AvatarFallback>
            {name ? initials(name) : <Users className="size-5" aria-hidden="true" />}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{name}</div>
          <span
            className={cn(
              'inline-block rounded-full px-2 py-0.5 font-medium text-xs',
              roleBadge[role]
            )}
          >
            {TeamRoleLabel[role] ?? 'Unknown'}
          </span>
        </div>
      </Card>
    </Link>
  )
}
