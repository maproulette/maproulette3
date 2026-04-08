import { Link } from '@tanstack/react-router'
import {
  BarChart3,
  Database,
  FolderKanban,
  ListChecks,
  Puzzle,
  Settings,
  Shield,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export const SuperAdminHome = () => {
  return (
    <div className="mx-auto px-4">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
          <h1 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
            Super Admin Dashboard
          </h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Manage all aspects of the MapRoulette platform
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Users */}
        <Link to="/super-admin/users">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage all platform users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Users
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Projects */}
        <Link to="/super-admin/projects">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <FolderKanban className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>View and manage all projects across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Projects
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Challenges */}
        <Link to="/super-admin/challenges">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <ListChecks className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Challenges</CardTitle>
              <CardDescription>Browse and manage all challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Challenges
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Plugins */}
        <Link to="/super-admin/plugins">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                <Puzzle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Plugins</CardTitle>
              <CardDescription>Manage plugins and integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Plugins
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Analytics */}
        <Link to="/super-admin/analytics">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View platform-wide analytics and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Database */}
        <Card className="opacity-50">
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900">
              <Database className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <CardTitle>Database</CardTitle>
            <CardDescription>Database management and maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Link to="/super-admin/settings">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-slate-800">
                <Settings className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              </div>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Platform settings and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Settings
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
