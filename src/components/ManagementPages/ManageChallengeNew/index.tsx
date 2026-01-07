import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/api'
import { ChallengeForm, type ChallengeFormValues } from '@/components/shared/ChallengeForm'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'
import type { Challenge } from '@/types/Challenge'

interface ManageChallengeNewProps {
  projectId?: number
}

export const ManageChallengeNew = ({ projectId }: ManageChallengeNewProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: projects } = useQuery(api.project.getManagedProjects({ limit: 100 }))

  const handleSubmit = async (values: ChallengeFormValues) => {
    const selectedProjectId = values.projectId
    if (!selectedProjectId) {
      throw new Error('Project ID is required to create a challenge')
    }

    const challengeData: Partial<Challenge> = {
      name: values.name,
      description: values.description || '',
      blurb: values.blurb || '',
      instruction: values.instruction || '',
      difficulty: values.difficulty,
      enabled: values.enabled,
      featured: values.featured,
    }

    if (values.dataSource === 'overpass') {
      challengeData.overpassQL = values.overpassQL || ''
    } else {
      challengeData.overpassQL = ''
    }

    if (values.dataSource === 'remoteGeoJSON' && values.remoteGeoJSON) {
      ;(challengeData as Record<string, unknown>).remoteGeoJson = values.remoteGeoJSON
    }

    const newChallenge = await api.challenge.createChallenge(selectedProjectId, challengeData)

    if (values.dataSource === 'localGeoJSON' && values.localGeoJSON && newChallenge.id) {
      try {
        await api.challenge.uploadGeoJSON(newChallenge.id, values.localGeoJSON, {
          dataOriginDate: values.dataOriginDate || undefined,
          skipSnapshot: true,
        })
      } catch (error) {
        console.error('Error uploading GeoJSON:', error)
        throw new Error(
          'Failed to upload GeoJSON file. Challenge was created but tasks may not be available.'
        )
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['projectChallenges', selectedProjectId] })
    await queryClient.invalidateQueries({ queryKey: ['challenge', newChallenge.id] })

    if (newChallenge.id) {
      navigate({
        to: '/manage/challenge/$challengeId',
        params: { challengeId: String(newChallenge.id) },
      })
    } else {
      navigate({
        to: '/manage/project/$projectId',
        params: { projectId: selectedProjectId.toString() },
      })
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
      <ChallengeForm
        projectId={projectId}
        projects={projects}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </ManageFormLayout>
  )
}
