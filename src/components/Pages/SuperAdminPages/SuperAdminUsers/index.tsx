import { Calendar, ChevronLeft, ChevronRight, Mail, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/api'
import { SearchBar } from '@/components/shared/SearchBar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { formatDate } from '@/lib/formatDate'
import { isSuperUser } from '@/lib/SuperAdminGuard'
import { cn } from '@/lib/utils'
import type { User } from '@/types/User'

const getUserRole = (user: User): string => {
  if (isSuperUser(user)) return 'super_admin'

  const hasAdminGrant = user.grants?.some((grant) => grant.role === 1) ?? false
  if (hasAdminGrant) return 'admin'

  return 'user'
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'admin':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }
}

export const SuperAdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const limit = 50

  const { data: users, isLoading } = api.user.getAllUsers({ limit, page })

  const { data: superUserIds } = api.user.getSuperUsers()

  const filteredUsers =
    users?.filter(
      (user) =>
        user.osmProfile.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.settings?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? []

  const totalUsers = users?.length ?? 0
  const hasNextPage = totalUsers === limit
  const hasPreviousPage = page > 0

  return (
    <div className="mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-50">
                User Management
              </h1>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Manage all users and their permissions across the platform
            </p>
          </div>
          <Button size="lg">
            <Users className="mr-2 h-5 w-5" />
            Add New User
          </Button>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users by name or email..."
        />
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Users on Page</CardDescription>
            <CardTitle className="text-3xl">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Showing {limit} per page</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Filtered Results</CardDescription>
            <CardTitle className="text-3xl">{filteredUsers.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Based on current search</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Super Admins</CardDescription>
            <CardTitle className="text-3xl">{superUserIds?.length ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Platform-wide</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>A list of all users in the system (page {page + 1})</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={!hasPreviousPage || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNextPage || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-zinc-600 dark:text-zinc-400">Loading users...</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>OSM ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const role = getUserRole(user)
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <img
                              src={user.osmProfile.avatarURL}
                              alt={user.osmProfile.displayName}
                              className="h-8 w-8 rounded-full"
                            />
                            <div>
                              <div>{user.osmProfile.displayName}</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`https://www.openstreetmap.org/user/${user.osmProfile.displayName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {user.osmProfile.id}
                          </a>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-zinc-400" />
                            {user.settings?.email || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('capitalize', getRoleBadgeColor(role))}>
                            {role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{user.score ?? 0}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-zinc-400" />
                            {formatDate(user.created)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {filteredUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="mb-4 h-12 w-12 text-zinc-400" />
                  <h3 className="mb-2 font-semibold text-lg text-zinc-900 dark:text-zinc-50">
                    No users found
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Try adjusting your search query
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
