import { useNavigate } from '@tanstack/react-router'
import { api } from '@/api'
import {
  ProjectForm,
  type ProjectFormValues,
} from '@/components/ManagementPages/ManageProjectNew/ProjectForm'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'

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
      guidanceTitle="Project Setup Tips"
      guidanceDescription="Create projects that are easy to maintain and safe to publish."
      guidanceItems={[
        'Use a stable internal name convention for region/theme/version.',
        'Keep description concise and include mapper context and expected outputs.',
        'Start with Discoverable off until at least one challenge is validated.',
      ]}
      guidanceLinks={[
        {
          label: 'Project Management Guide',
          href: 'https://learn.maproulette.org/documentation/project-management/',
        },
        {
          label: 'Challenge Creation Guide',
          href: 'https://learn.maproulette.org/en-US/documentation/creating-a-challenge/',
        },
      ]}
    >
      <ProjectForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </ManageFormLayout>
  )
}
