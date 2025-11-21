import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { AuthGuard } from '@/components/shared'
import { ProjectForm, type ProjectFormValues } from '@/components/shared/ProjectForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export const ManageProjectNew = () => {
  const navigate = useNavigate()

  const handleSubmit = async (values: ProjectFormValues) => {
    console.log('Creating project:', values)

    // TODO: Implement API call to create project
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Navigate back to projects list
    navigate({ to: '/manage/projects' })
  }

  const handleCancel = () => {
    navigate({ to: '/manage/projects' })
  }

  return (
    <AuthGuard>
      <div className="container">
        <Link
          to="/manage/projects"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl text-zinc-900 dark:text-zinc-50">
            Create New Project
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Create a new MapRoulette project to organize your challenges
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Fill in the information below to create your new project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
