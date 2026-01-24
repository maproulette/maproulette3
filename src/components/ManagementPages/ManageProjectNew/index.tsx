import { useNavigate } from '@tanstack/react-router'
import { api } from '@/api'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'
import { ProjectForm, type ProjectFormValues } from '@/components/shared/ProjectForm'

export const ManageProjectNew = () => {
  const navigate = useNavigate()
  const createProjectMutation = api.project.useCreateProject()

  const handleSubmit = async (values: ProjectFormValues) => {
    const newProject = await createProjectMutation.mutateAsync({
      name: values.name,
      displayName: values.displayName,
      description: values.description || undefined,
      enabled: values.enabled,
      featured: values.featured,
    })

    if (newProject.id) {
      navigate({ to: '/manage/project/$projectId', params: { projectId: String(newProject.id) } })
    } else {
      navigate({ to: '/manage/projects' })
    }
  }

  const handleCancel = () => {
    navigate({ to: '/manage/projects' })
  }

  return (
    <ManageFormLayout
      backTo="/manage/projects"
      backLabel="Back to Projects"
      pageTitle="Create New Project"
      pageDescription="Create a new MapRoulette project to organize your challenges"
      cardTitle="Project Details"
      cardDescription="Fill in the information below to create your new project"
    >
      <ProjectForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </ManageFormLayout>
  )
}
