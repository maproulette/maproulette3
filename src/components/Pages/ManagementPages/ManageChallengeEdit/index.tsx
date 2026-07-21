import { useParams } from '@tanstack/react-router'
import { ChallengeForm } from '@/components/Pages/ManagementPages/ManageChallengeNew/ChallengeForm'
import { FormCard, ManageFormLayout } from '@/components/shared/ManageFormLayout'
import { EditChallengeFormProvider, useChallengeFormContext } from '@/contexts/ChallengeFormContext'

const EditChallengeLayout = () => {
  const { isLoading } = useChallengeFormContext()

  return (
    <ManageFormLayout>
      <FormCard
        title="Challenge Editor"
        description="Modify the information below to update your challenge"
        isLoading={isLoading}
      >
        <ChallengeForm />
      </FormCard>
    </ManageFormLayout>
  )
}

export const ManageChallengeEdit = () => {
  const { challengeId } = useParams({ from: '/_app/manage/challenge/$challengeId/edit' })
  return (
    <EditChallengeFormProvider challengeId={Number(challengeId)}>
      <EditChallengeLayout />
    </EditChallengeFormProvider>
  )
}
