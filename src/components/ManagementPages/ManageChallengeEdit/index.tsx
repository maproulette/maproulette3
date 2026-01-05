import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { api } from '@/api'
import { ChallengeForm, type ChallengeFormValues } from '@/components/shared/ChallengeForm'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'

export const ManageChallengeEdit = () => {
  const { challengeId } = useParams({ from: '/_app/manage/challenge/$challengeId/edit' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: challengeData, isLoading: isLoadingChallenge } = useSuspenseQuery(
    api.challenge.getChallenge(Number(challengeId))
  )

  const handleSubmit = async (values: ChallengeFormValues) => {
    await api.challenge.updateChallenge(Number(challengeId), {
      name: values.name,
      description: values.description || undefined,
      blurb: values.blurb || undefined,
      instruction: values.instruction || undefined,
      difficulty: values.difficulty,
      enabled: values.enabled,
      featured: values.featured,
      overpassQL: values.overpassQL || undefined,
    })

    await queryClient.invalidateQueries({ queryKey: ['challenge', Number(challengeId)] })
    if (challengeData?.parent) {
      await queryClient.invalidateQueries({ queryKey: ['projectChallenges', challengeData.parent] })
    }

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
