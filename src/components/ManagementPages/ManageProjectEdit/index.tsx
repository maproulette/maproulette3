import { useNavigate, useParams } from '@tanstack/react-router'
import { api } from '@/api'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'
import { ProjectForm, type ProjectFormValues } from '@/components/shared/ProjectForm'

export const ManageProjectEdit = () => {
  const { projectId } = useParams({ from: '/_app/manage/project/$projectId/edit' })
  const navigate = useNavigate()

  const { data: projectData, isLoading } = api.project.getProject(Number(projectId))
  const updateProjectMutation = api.project.useUpdateProject()

  const handleSubmit = async (values: ProjectFormValues) => {
    await updateProjectMutation.mutateAsync({
      projectId: Number(projectId),
      updates: {
        name: values.name,
        displayName: values.displayName,
        description: values.description || undefined,
        enabled: values.enabled,
        featured: values.featured,
      },
    })

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
      guidanceTitle="Editing Checklist"
      guidanceDescription="Changes here affect every challenge in the project."
      guidanceItems={[
        'Avoid renaming internal identifiers unless downstream references are handled.',
        'Review discoverability and archive state before major content updates.',
        'Coordinate manager ownership updates before high-volume launches.',
      ]}
      guidanceLinks={[
        {
          label: 'Project Management Guide',
          href: 'https://learn.maproulette.org/documentation/project-management/',
        },
      ]}
    >
      <ProjectForm project={projectData} onSubmit={handleSubmit} onCancel={handleCancel} />
    </ManageFormLayout>
  )
}
