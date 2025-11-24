import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/api'
import { AuthGuard } from '@/components/shared'
import { ProjectForm, type ProjectFormValues } from '@/components/shared/ProjectForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export const ManageProjectEdit = () => {
  const { projectId } = useParams({ from: '/_app/manage/project/$projectId/edit' })
  const navigate = useNavigate()

  const { data: projectData, isLoading } = useSuspenseQuery(
    api.project.getProject(Number(projectId))
  )

  const handleSubmit = async (values: ProjectFormValues) => {
    console.log('Updating project:', projectId, values)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    navigate({ to: '/manage/project/$projectId', params: { projectId } })
  }

  const handleCancel = () => {
    navigate({ to: '/manage/project/$projectId', params: { projectId } })
  }

  return (
    <AuthGuard>
      <div className="container">
        <Link
          to="/manage/project/$projectId"
          params={{ projectId }}
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl text-zinc-900 dark:text-zinc-50">
            {isLoading ? (
              <Skeleton className="h-9 w-64" />
            ) : (
              `Edit ${projectData?.displayName || projectData?.name}`
            )}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">Update the project information below</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Modify the information below to update your project</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <ProjectForm project={projectData} onSubmit={handleSubmit} onCancel={handleCancel} />
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
