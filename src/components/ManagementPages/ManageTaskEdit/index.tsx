import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { AuthGuard } from '@/components/shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export const ManageTaskEdit = () => {
  const { taskId } = useParams({ from: '/_app/manage/task/$taskId/edit' })

  return (
    <AuthGuard>
      <div className="container">
        <Link
          to="/manage/task/$taskId"
          params={{ taskId }}
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Task
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl text-zinc-900 dark:text-zinc-50">
            Edit Task #{taskId}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">Task editing functionality coming soon</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>Task management functionality is under development</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              The ability to edit tasks will be available in a future update. For now, you can
              manage tasks through their parent challenges.
            </p>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
