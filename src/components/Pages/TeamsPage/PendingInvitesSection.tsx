import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { logger } from '@/lib/logger'
import type { TeamUser } from '@/types/Team'

interface Props {
  invites: TeamUser[]
}

export const PendingInvitesSection = ({ invites }: Props) => {
  const accept = api.team.useAcceptInvite()
  const decline = api.team.useDeclineInvite()

  const handleAccept = async (teamId: number) => {
    try {
      await accept.mutateAsync(teamId)
      toast.success('Invitation accepted')
    } catch (error) {
      logger.error('Accept invite failed', { error })
      toast.error('Could not accept invitation')
    }
  }

  const handleDecline = async (teamId: number) => {
    try {
      await decline.mutateAsync(teamId)
      toast.success('Invitation declined')
    } catch (error) {
      logger.error('Decline invite failed', { error })
      toast.error('Could not decline invitation')
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-semibold text-sm text-zinc-700 dark:text-slate-300">
        You have {invites.length} pending invitation{invites.length === 1 ? '' : 's'}
      </h2>
      <ul className="space-y-2">
        {invites.map((invite) => (
          <li key={invite.id}>
            <Card className="flex items-center justify-between gap-3 p-3">
              <div className="font-medium">{invite.name || `Team #${invite.teamId}`}</div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDecline(invite.teamId)}
                  disabled={decline.isPending}
                >
                  <X className="size-4" aria-hidden="true" /> Decline
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAccept(invite.teamId)}
                  disabled={accept.isPending}
                >
                  <Check className="size-4" aria-hidden="true" /> Accept
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
