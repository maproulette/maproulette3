import { Award, CalendarDays, MapPin, Shield, Trophy, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthContext } from '@/contexts/AuthContext'
import { AuthGuard } from '../shared/AuthGuard'

export const Dashboard = () => {
  const { user } = useAuthContext()

  const formatDate = (epoch: number) => {
    return new Date(epoch).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const accountAge = user ? Math.floor((Date.now() - user.created) / (1000 * 60 * 60 * 24)) : 0

  return (
    <AuthGuard>
      {user && (
        <div className="bg-gradient-to-br from-background to-muted/20 p-6">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Header Section */}
            <div className="flex items-center gap-6 rounded-lg border bg-card p-6 shadow-sm">
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                <AvatarImage
                  src={user.osmProfile.avatarURL || ''}
                  alt={user.osmProfile.displayName}
                />
                <AvatarFallback className="bg-primary/10 font-bold text-2xl text-primary">
                  {getInitials(user.osmProfile.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="mb-1 font-bold text-3xl tracking-tight">
                  {user.osmProfile.displayName}
                </h1>
                <p className="text-muted-foreground">
                  OpenStreetMap Contributor
                  {!user.guest && <Badge className="ml-2">Verified</Badge>}
                  {user.guest && (
                    <Badge variant="outline" className="ml-2">
                      Guest
                    </Badge>
                  )}
                </p>
                <div className="mt-3 flex items-center gap-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>Member since {formatDate(user.created)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{accountAge} days active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Score Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">Total Score</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">{user.score?.toLocaleString() || 0}</div>
                  <p className="text-muted-foreground text-xs">Points earned from contributions</p>
                </CardContent>
              </Card>

              {/* Achievements Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">Achievements</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">{user.achievements?.length || 0}</div>
                  <p className="text-muted-foreground text-xs">Unlocked achievements</p>
                </CardContent>
              </Card>

              {/* Following Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">Following</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">{user.followingGroupId ? '✓' : '—'}</div>
                  <p className="text-muted-foreground text-xs">Following group active</p>
                </CardContent>
              </Card>

              {/* Permissions Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">Permissions</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">{user.grants?.length || 0}</div>
                  <p className="text-muted-foreground text-xs">Active grants</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Information Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Profile Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground text-sm">User ID</span>
                    <span className="font-medium font-mono text-sm">{user.id}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground text-sm">OSM User ID</span>
                    <span className="font-medium font-mono text-sm">{user.osmProfile.id}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground text-sm">Account Created</span>
                    <span className="font-medium text-sm">{formatDate(user.created)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground text-sm">Last Modified</span>
                    <span className="font-medium text-sm">{formatDate(user.modified)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Account Type</span>
                    <span className="font-medium text-sm">
                      {user.guest ? 'Guest' : 'Registered User'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Grants & Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle>Permissions & Grants</CardTitle>
                  <CardDescription>Your access levels and roles</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.grants && user.grants.length > 0 ? (
                    <div className="space-y-2">
                      {user.grants.map((grant) => (
                        <div
                          key={grant.id}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {grant.role === 1 && 'Super User'}
                              {grant.role === 2 && 'Admin'}
                              {grant.role === 3 && 'Write Access'}
                              {grant.role === 4 && 'Read Only'}
                              {![1, 2, 3, 4].includes(grant.role) && `Role ${grant.role}`}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {grant.target
                                ? `Target: ${grant.target.objectType.id} #${grant.target.objectId}`
                                : 'Global'}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {grant.grantee.granteeType.id === 1 && 'User'}
                            {grant.grantee.granteeType.id === 2 && 'Group'}
                            {grant.grantee.granteeType.id === 3 && 'Project'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                      <p className="text-muted-foreground text-sm">No grants assigned</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Achievements Section */}
            {user.achievements && user.achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Achievements Unlocked</CardTitle>
                  <CardDescription>
                    You've earned {user.achievements.length} achievement
                    {user.achievements.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.achievements.map((achievement) => (
                      <Badge key={achievement} variant="outline" className="px-3 py-1 text-sm">
                        <Award className="mr-1 h-3 w-3" />
                        Achievement #{achievement}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
