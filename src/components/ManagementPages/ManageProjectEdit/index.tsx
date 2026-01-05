import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { api } from '@/api'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'
import { ProjectForm, type ProjectFormValues } from '@/components/shared/ProjectForm'

export const ManageProjectEdit = () => {
  const { projectId } = useParams({ from: '/_app/manage/project/$projectId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: projectData, isLoading } = useSuspenseQuery(
    api.project.getProject(Number(projectId))
  )

  const handleSubmit = async (values: ProjectFormValues) => {
    await api.project.updateProject(Number(projectId), {
      name: values.name,
      displayName: values.displayName,
      description: values.description || undefined,
      enabled: values.enabled,
      featured: values.featured,
    })

    await queryClient.invalidateQueries({ queryKey: ['project', Number(projectId)] })
    await queryClient.invalidateQueries({ queryKey: ['managedProjects'] })

    navigate({ to: '/manage/project/$projectId', params: { projectId } })
  }

  const handleCancel = () => {
    navigate({ to: '/manage/project/$projectId', params: { projectId } })
  }

  return (
    <ManageFormLayout
      backTo="/manage/project/$projectId"
      backParams={{ projectId }}
      backLabel="Back to Project"
      pageTitle={isLoading ? '' : `Edit ${projectData?.displayName || projectData?.name}`}
      pageDescription="Update the project information below"
      cardTitle="Project Details"
      cardDescription="Modify the information below to update your project"
      isLoading={isLoading}
    >
      <ProjectForm project={projectData} onSubmit={handleSubmit} onCancel={handleCancel} />
    </ManageFormLayout>
  )
}
