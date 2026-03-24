import { useNavigate, useParams } from '@tanstack/react-router'
import { api } from '@/api'
import { ChallengeForm, type ChallengeFormValues } from '@/components/shared/ChallengeForm'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'
import type { Challenge } from '@/types/Challenge'

export const ManageChallengeEdit = () => {
  const { challengeId } = useParams({ from: '/_app/manage/challenge/$challengeId/edit' })
  const navigate = useNavigate()

  const { data: challengeData, isLoading: isLoadingChallenge } = api.challenge.getChallenge(
    Number(challengeId)
  )

  const updateChallengeMutation = api.challenge.useUpdateChallenge()

  const handleSubmit = async (values: ChallengeFormValues) => {
    const updateData: Partial<Challenge> & Record<string, unknown> = {
      name: values.name,
      description: values.description || undefined,
      blurb: values.blurb || undefined,
      instruction: values.instruction || undefined,
      difficulty: values.difficulty,
      enabled: values.enabled,
      featured: values.featured,
    }

    if (values.dataSource === 'overpass') {
      updateData.overpassQL = values.overpassQL || undefined
    } else {
      updateData.overpassQL = ''
    }

    if (values.dataSource === 'remoteGeoJSON' && values.remoteGeoJSON) {
      updateData.remoteGeoJson = values.remoteGeoJSON
    }

    if (values.dataSource === 'localGeoJSON' && values.localGeoJSON) {
      const text = await values.localGeoJSON.text()
      updateData.localGeoJSON = JSON.parse(text) as unknown
      if (values.dataOriginDate) {
        ;(updateData as Record<string, unknown>).dataOriginDate = values.dataOriginDate
      }
    }

    await updateChallengeMutation.mutateAsync({
      challengeId: Number(challengeId),
      updates: updateData,
    })

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
      guidanceTitle="Challenge Update Tips"
      guidanceDescription="Use edits to improve clarity and reduce mapper confusion."
      guidanceItems={[
        'When changing instructions, confirm they still match task geometry.',
        'Revisit difficulty and featured status after major data updates.',
        'If data source changes, test generated tasks before enabling discoverable.',
      ]}
      guidanceLinks={[
        {
          label: 'Challenge Creation Guide',
          href: 'https://learn.maproulette.org/en-US/documentation/creating-a-challenge/',
        },
      ]}
    >
      <ChallengeForm
        challenge={challengeData}
        projectId={challengeData?.parent}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </ManageFormLayout>
  )
}
