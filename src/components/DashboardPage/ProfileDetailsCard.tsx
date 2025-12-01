import { Compass, Flag, Globe, Map as MapIcon, MapPin, Route } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { User } from '@/types/User'
import { formatDate } from '@/utils/formatUtils'

interface ProfileDetailsCardProps {
  user: User
}

export const ProfileDetailsCard = ({ user }: ProfileDetailsCardProps) => {
  return (
    <Card className="border-2 border-blue-200/50 dark:border-blue-500/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg p-2">
            <MapIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle>Mapper Profile</CardTitle>
            <CardDescription>Your explorer credentials</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-lg bg-background/60 p-3 backdrop-blur transition-colors hover:bg-background/80">
          <span className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4" />
            Mapper ID
          </span>
          <span className="font-bold font-mono text-sm">{user.id}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-background/60 p-3 backdrop-blur transition-colors hover:bg-background/80">
          <span className="flex items-center gap-2 text-muted-foreground text-sm">
            <Globe className="h-4 w-4" />
            OSM User ID
          </span>
          <span className="font-bold font-mono text-sm">{user.osmProfile.id}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-background/60 p-3 backdrop-blur transition-colors hover:bg-background/80">
          <span className="flex items-center gap-2 text-muted-foreground text-sm">
            <Flag className="h-4 w-4" />
            Journey Started
          </span>
          <span className="font-semibold text-sm">{formatDate(user.created)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-background/60 p-3 backdrop-blur transition-colors hover:bg-background/80">
          <span className="flex items-center gap-2 text-muted-foreground text-sm">
            <Route className="h-4 w-4" />
            Last Activity
          </span>
          <span className="font-semibold text-sm">{formatDate(user.modified)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-background/60 p-3 backdrop-blur transition-colors hover:bg-background/80">
          <span className="flex items-center gap-2 text-muted-foreground text-sm">
            <Compass className="h-4 w-4" />
            Mapper Class
          </span>
          <Badge
            variant={user.guest ? 'outline' : 'default'}
            className={
              user.guest
                ? 'border-yellow-500 text-yellow-700'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
            }
          >
            {user.guest ? '🎒 Explorer' : '🗺️ Registered'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
