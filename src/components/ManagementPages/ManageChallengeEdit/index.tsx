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
  const uploadGeoJSONMutation = api.challenge.useUploadGeoJSON()

  const handleSubmit = async (values: ChallengeFormValues) => {
    const updateData: Partial<Challenge> = {
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
      ;(updateData as Record<string, unknown>).remoteGeoJson = values.remoteGeoJSON
    }

    await updateChallengeMutation.mutateAsync({
      challengeId: Number(challengeId),
      updates: updateData,
    })

    if (values.dataSource === 'localGeoJSON' && values.localGeoJSON) {
      try {
        await uploadGeoJSONMutation.mutateAsync({
          challengeId: Number(challengeId),
          geoJSONFile: values.localGeoJSON,
          options: {
            dataOriginDate: values.dataOriginDate || undefined,
            removeUnmatched: false,
            skipSnapshot: true,
          },
        })
      } catch (error) {
        console.error('Error uploading GeoJSON:', error)
        throw new Error(
          'Failed to upload GeoJSON file. Challenge was updated but tasks may not have been refreshed.'
        )
      }
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
      <ChallengeForm
        challenge={challengeData}
        projectId={challengeData?.parent}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </ManageFormLayout>
  )
}
