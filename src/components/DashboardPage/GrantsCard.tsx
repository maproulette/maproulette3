import { Shield } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { User } from '@/types/User'

interface GrantsCardProps {
  user: User
}

const getRoleName = (role: number): string => {
  switch (role) {
    case 1:
      return '👑 Super User'
    case 2:
      return '⚔️ Admin'
    case 3:
      return '✍️ Write Access'
    case 4:
      return '👁️ Read Only'
    default:
      return `🎯 Role ${role}`
  }
}

const getGranteeTypeName = (typeId: number): string => {
  switch (typeId) {
    case 1:
      return '👤 User'
    case 2:
      return '👥 Group'
    case 3:
      return '📁 Project'
    default:
      return '❓ Unknown'
  }
}

export const GrantsCard = ({ user }: GrantsCardProps) => {
  const hasGrants = user.grants && user.grants.length > 0

  return (
    <Card className="border-2 border-purple-200/50 dark:border-purple-500/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg p-2">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle>Access Privileges</CardTitle>
            <CardDescription>Your mapping permissions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasGrants ? (
          <div className="space-y-2">
            {user.grants?.map((grant) => (
              <div
                key={grant.id}
                className="group flex items-center justify-between rounded-lg border-2 border-purple-200/30 p-3 backdrop-blur transition-all hover:border-purple-300 hover:shadow-md dark:border-purple-500/20"
              >
                <div className="flex flex-1 items-center gap-3">
                  <div className="rounded-full bg-purple-500/20 p-1.5">
                    <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{getRoleName(grant.role)}</p>
                    <p className="text-muted-foreground text-xs">
                      {grant.target
                        ? `Target: ${grant.target.objectType.id} #${grant.target.objectId}`
                        : '🌍 Global Access'}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-purple-500/20 text-purple-700 dark:text-purple-300"
                >
                  {getGranteeTypeName(grant.grantee.granteeType.id)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted border-dashed">
            <Shield className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-muted-foreground text-sm">No special grants assigned</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
