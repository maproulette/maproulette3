import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { api } from '@/api'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'
import { ProjectForm, type ProjectFormValues } from '@/components/shared/ProjectForm'

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
