import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { api } from '@/api'
import { ChallengeForm, type ChallengeFormValues } from '@/components/shared/ChallengeForm'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'

export const ManageChallengeEdit = () => {
  const { challengeId } = useParams({ from: '/_app/manage/challenge/$challengeId/edit' })
  const navigate = useNavigate()

  const { data: challengeData, isLoading: isLoadingChallenge } = useSuspenseQuery(
    api.challenge.getChallenge(Number(challengeId))
  )

  const handleSubmit = async (values: ChallengeFormValues) => {
    console.log('Updating challenge:', challengeId, values)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    navigate({
      to: '/manage/challenge/$challengeId',
      params: { challengeId },
    })
  }

  const handleCancel = () => {
    navigate({
      to: '/manage/challenge/$challengeId',
      params: { challengeId },
    })
  }

  return (
    <ManageFormLayout
      backTo="/manage/challenge/$challengeId"
      backParams={{ challengeId }}
      backLabel="Back to Challenge"
      pageTitle={isLoadingChallenge ? '' : `Edit ${challengeData?.name}`}
      pageDescription="Update the challenge information below"
      cardTitle="Challenge Details"
      cardDescription="Modify the information below to update your challenge"
      isLoading={isLoadingChallenge}
    >
      <ChallengeForm challenge={challengeData} onSubmit={handleSubmit} onCancel={handleCancel} />
    </ManageFormLayout>
  )
}
