import { useNavigate } from '@tanstack/react-router'
import { ManageFormLayout } from '@/components/shared'
import { ProjectForm, type ProjectFormValues } from '@/components/shared/ProjectForm'

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
