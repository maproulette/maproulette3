import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { AuthGuard } from '@/components/shared'
import { ChallengeForm, type ChallengeFormValues } from '@/components/shared/ChallengeForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

interface ManageChallengeNewProps {
  projectId?: number
}

export const ManageChallengeNew = ({ projectId }: ManageChallengeNewProps) => {
  const navigate = useNavigate()

  const handleSubmit = async (values: ChallengeFormValues) => {
    console.log('Creating challenge:', values, 'projectId:', projectId)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (projectId) {
      navigate({ to: '/manage/project/$projectId', params: { projectId: projectId.toString() } })
    } else {
      navigate({ to: '/manage/challenges' })
    }
  }

  const handleCancel = () => {
    if (projectId) {
      navigate({ to: '/manage/project/$projectId', params: { projectId: projectId.toString() } })
    } else {
      navigate({ to: '/manage/challenges' })
    }
  }

  return (
    <AuthGuard>
      <div className="container">
        <Link
          to={projectId ? '/manage/project/$projectId' : '/manage/challenges'}
          params={projectId ? { projectId: projectId.toString() } : undefined}
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {projectId ? 'Back to Project' : 'Back to Challenges'}
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl text-zinc-900 dark:text-zinc-50">
            Create New Challenge
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">Create a new MapRoulette challenge</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Challenge Details</CardTitle>
            <CardDescription>
              Fill in the information below to create your new challenge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChallengeForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
