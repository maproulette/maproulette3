import { Link } from '@tanstack/react-router'
import { CheckSquare, FolderKanban, ListChecks } from 'lucide-react'
import { AuthGuard } from '@/components/shared'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export const ManageHome = () => {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl text-zinc-900 dark:text-zinc-50">
            Create and Manage
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your MapRoulette projects, challenges, and tasks
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link to="/manage/projects">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <FolderKanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Create and manage your MapRoulette projects</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Projects
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/manage/challenges">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <ListChecks className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Challenges</CardTitle>
                <CardDescription>Browse and manage all your challenges</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Challenges
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="opacity-50">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <CheckSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>View and manage individual tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
