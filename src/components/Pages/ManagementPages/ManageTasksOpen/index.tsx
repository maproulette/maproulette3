import { Link, useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useId, useState } from 'react'
import { BackLink } from '@/components/ui/BackLink'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { SuperAdminGuard } from '@/lib/SuperAdminGuard'

/**
 * Simple "Open task by ID" page. Linked from Manage home Tasks card.
 * Enter a task ID to view or edit the task in the manage flow.
 */
export const ManageTasksOpen = () => {
  const navigate = useNavigate()
  const taskIdInputId = useId()
  const [taskIdInput, setTaskIdInput] = useState('')

  const taskId = taskIdInput.trim() ? Number(taskIdInput.trim()) : null
  const isValidId = taskId != null && !Number.isNaN(taskId) && taskId > 0

  const handleView = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidId) return
    navigate({ to: '/manage/task/$taskId', params: { taskId: String(taskId) } })
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidId) return
    navigate({ to: '/manage/task/$taskId/edit', params: { taskId: String(taskId) } })
  }

  return (
    <SuperAdminGuard>
      <div className="mx-auto max-w-xl px-4">
        <BackLink to="/manage">Back to Manage</BackLink>

        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl text-zinc-900 dark:text-zinc-50">Tasks</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Open a task by ID to view details or edit it (name, instructions, status, etc.).
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Open task by ID
            </CardTitle>
            <CardDescription>
              Enter a task ID below. You can find task IDs when working on a task (URL or header) or
              from your saved/locked tasks on the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleView}>
              <div className="space-y-2">
                <Label htmlFor={taskIdInputId}>Task ID</Label>
                <Input
                  id={taskIdInputId}
                  type="number"
                  min={1}
                  placeholder="e.g. 12345"
                  value={taskIdInput}
                  onChange={(e) => setTaskIdInput(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={!isValidId}>
                  View task
                </Button>
                <Button type="button" variant="outline" disabled={!isValidId} onClick={handleEdit}>
                  Edit task
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Or go to{' '}
          <Link to="/manage/projects" className="text-blue-600 hover:underline dark:text-blue-400">
            Projects
          </Link>{' '}
          or{' '}
          <Link
            to="/manage/challenges"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Challenges
          </Link>{' '}
          to find a challenge, then browse it to open a task and get its ID from the URL.
        </p>
      </div>
    </SuperAdminGuard>
  )
}
