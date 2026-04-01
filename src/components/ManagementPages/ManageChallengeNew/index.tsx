import { useNavigate } from '@tanstack/react-router'
import { api } from '@/api'
import {
  ChallengeForm,
  type ChallengeFormValues,
} from '@/components/ManagementPages/ManageChallengeNew/ChallengeForm'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'
import type { Challenge } from '@/types/Challenge'

interface ManageChallengeNewProps {
  projectId?: number
}

export const ManageChallengeNew = ({ projectId }: ManageChallengeNewProps) => {
  const navigate = useNavigate()

  const { data: projects } = api.project.getManagedProjects({ limit: 100 })

  const createChallengeMutation = api.challenge.useCreateChallenge()

  const handleSubmit = async (values: ChallengeFormValues) => {
    const selectedProjectId = values.projectId
    if (!selectedProjectId) {
      throw new Error('Project ID is required to create a challenge')
    }

    const challengeData: Partial<Challenge> & Record<string, unknown> = {
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
      challengeData.remoteGeoJson = values.remoteGeoJSON
    }

    if (values.dataSource === 'localGeoJSON' && values.localGeoJSON) {
      const text = await values.localGeoJSON.text()
      challengeData.localGeoJSON = JSON.parse(text) as unknown
      if (values.dataOriginDate) {
        ;(challengeData as Record<string, unknown>).dataOriginDate = values.dataOriginDate
      }
    }

    const newChallenge = await createChallengeMutation.mutateAsync({
      projectId: selectedProjectId,
      challengeData,
    })

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
      guidanceTitle="Challenge Authoring Tips"
      guidanceDescription="Aim for clear, repeatable task instructions and data quality."
      guidanceItems={[
        'Write mapper instructions with exact pass/fail criteria.',
        'Validate task data source and geometry quality before publishing.',
        'Set realistic difficulty to match expected contributor skill.',
      ]}
      guidanceLinks={[
        {
          label: 'Challenge Creation Guide',
          href: 'https://learn.maproulette.org/en-US/documentation/creating-a-challenge/',
        },
        {
          label: 'Overpass Query Docs',
          href: 'https://learn.maproulette.org/documentation/overpass-queries/',
        },
      ]}
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
