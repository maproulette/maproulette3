import { Link, useNavigate } from '@tanstack/react-router'
import { Pencil, Trash2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'
import { useAuthContext } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { initials } from '@/lib/utils'
import type { TeamRole, TeamUser } from '@/types/Team'
import { TeamRoleLabel } from '@/types/Team'
import { InviteMemberDialog } from './InviteMemberDialog'

interface Props {
  teamId: number
}

const MemberRow = ({
  member,
  isAdmin,
  currentUserId,
  teamId,
}: {
  member: TeamUser
  isAdmin: boolean
  currentUserId: number | undefined
  teamId: number
}) => {
  const changeRole = api.team.useChangeRole()
  const removeMember = api.team.useRemoveMember()

  const handleRole = async (role: TeamRole) => {
    try {
      await changeRole.mutateAsync({ teamId, userId: member.userId, role })
      toast.success('Role updated')
    } catch (error) {
      logger.error('Role change failed', { error })
      toast.error('Could not update role')
    }
  }

  const handleRemove = async () => {
    try {
      await removeMember.mutateAsync({ teamId, userId: member.userId })
      toast.success('Member removed')
    } catch (error) {
      logger.error('Remove failed', { error })
      toast.error('Could not remove member')
    }
  }

  const role = member.status as TeamRole

  return (
    <li className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-slate-700">
      <Avatar className="size-9">
        <AvatarFallback>{initials(member.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{member.name}</div>
        <div className="text-xs text-zinc-500 dark:text-slate-400">
          {TeamRoleLabel[role] ?? 'Unknown'}
        </div>
      </div>
      {isAdmin && member.userId !== currentUserId && (
        <div className="flex gap-1">
          {role === 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRole(2)}
              disabled={changeRole.isPending}
            >
              Promote
            </Button>
          )}
          {role === 2 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRole(1)}
              disabled={changeRole.isPending}
            >
              Demote
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={removeMember.isPending}
            aria-label="Remove member"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </li>
  )
}

export const TeamDetailPage = ({ teamId }: Props) => {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { data: team, isLoading } = api.team.get(teamId)
  const { data: members = [] } = api.team.members(teamId)
  const deleteTeam = api.team.useDeleteTeam()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (isLoading) return <Loader />
  if (!team) {
    return <div className="py-12 text-center text-zinc-500">Team not found.</div>
  }

  const me = members.find((m) => m.userId === user?.id)
  const iAmAdmin = me?.status === 2

  const admins = members.filter((m) => m.status === 2)
  const regularMembers = members.filter((m) => m.status === 1)
  const invited = members.filter((m) => m.status === 0)

  const handleDelete = async () => {
    try {
      await deleteTeam.mutateAsync(teamId)
      toast.success('Team deleted')
      navigate({ to: '/teams' })
    } catch (error) {
      logger.error('Team delete failed', { error })
      toast.error('Could not delete team')
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <Avatar className="size-16">
            <AvatarImage src={team.avatarURL ?? ''} alt={team.name} />
            <AvatarFallback>{initials(team.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold text-xl">{team.name}</h1>
            {team.description && (
              <p className="mt-1 max-w-prose text-sm text-zinc-600 dark:text-slate-400">
                {team.description}
              </p>
            )}
            <p className="mt-1 text-xs text-zinc-500 dark:text-slate-500">
              {members.length} member{members.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        {iAmAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/teams/$teamId/edit" params={{ teamId: String(teamId) }}>
                <Pencil className="size-4" aria-hidden="true" /> Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="size-4" aria-hidden="true" /> Invite
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" aria-hidden="true" /> Delete
            </Button>
          </div>
        )}
      </div>

      {admins.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-medium text-sm text-zinc-700 dark:text-slate-300">Admins</h2>
          <ul className="space-y-2">
            {admins.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                isAdmin={iAmAdmin}
                currentUserId={user?.id}
                teamId={teamId}
              />
            ))}
          </ul>
        </section>
      )}

      {regularMembers.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-medium text-sm text-zinc-700 dark:text-slate-300">Members</h2>
          <ul className="space-y-2">
            {regularMembers.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                isAdmin={iAmAdmin}
                currentUserId={user?.id}
                teamId={teamId}
              />
            ))}
          </ul>
        </section>
      )}

      {invited.length > 0 && iAmAdmin && (
        <section className="space-y-2">
          <h2 className="font-medium text-sm text-zinc-700 dark:text-slate-300">Invited</h2>
          <ul className="space-y-2">
            {invited.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                isAdmin={iAmAdmin}
                currentUserId={user?.id}
                teamId={teamId}
              />
            ))}
          </ul>
        </section>
      )}

      <InviteMemberDialog teamId={teamId} open={inviteOpen} onOpenChange={setInviteOpen} />
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this team?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. All members will lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete team</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
