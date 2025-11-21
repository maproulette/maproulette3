import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { AuthGuard } from '@/components/shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export const ManageTaskNew = () => {
  return (
    <AuthGuard>
      <div className="container">
        <Link
          to="/manage"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Manage
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl text-zinc-900 dark:text-zinc-50">
            Create New Task
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Task creation functionality coming soon
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Task</CardTitle>
            <CardDescription>Task management functionality is under development</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Tasks are typically created in bulk through challenges. Individual task creation will
              be available in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
