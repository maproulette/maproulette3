import { useNavigate } from '@tanstack/react-router'
import { ChallengeForm, type ChallengeFormValues } from '@/components/shared/ChallengeForm'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'

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
    <ManageFormLayout
      backTo={projectId ? '/manage/project/$projectId' : '/manage/challenges'}
      backParams={projectId ? { projectId: projectId.toString() } : undefined}
      backLabel={projectId ? 'Back to Project' : 'Back to Challenges'}
      pageTitle="Create New Challenge"
      pageDescription="Create a new MapRoulette challenge"
      cardTitle="Challenge Details"
      cardDescription="Fill in the information below to create your new challenge"
    >
      <ChallengeForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </ManageFormLayout>
  )
}
