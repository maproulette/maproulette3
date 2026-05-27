import { useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo } from 'react'
import { api } from '@/api'
import type { ChallengeFormValues } from '@/components/Pages/ManagementPages/ManageChallengeNew/ChallengeForm'
import type { Challenge } from '@/types/Challenge'
import type { Project } from '@/types/Project'

interface ChallengeFormContextType {
  challenge?: Challenge
  projectId?: number
  projects?: Project[]
  isLoading: boolean
  onSubmit: (values: ChallengeFormValues) => Promise<void>
  onCancel: () => void
}

const ChallengeFormContext = createContext<ChallengeFormContextType | undefined>(undefined)

const buildChallengeData = async (values: ChallengeFormValues, isCreate: boolean) => {
  const data: Partial<Challenge> & Record<string, unknown> = {
    name: values.name,
    description: isCreate ? values.description || '' : values.description || undefined,
    instruction: isCreate ? values.instruction || '' : values.instruction || undefined,
    difficulty: values.difficulty,
    enabled: values.enabled,
    featured: values.featured,
  }

  if (values.dataSource === 'overpass') {
    data.overpassQL = isCreate ? values.overpassQL || '' : values.overpassQL || undefined
  } else {
    data.overpassQL = ''
  }

  if (values.dataSource === 'remoteGeoJSON' && values.remoteGeoJSON) {
    data.remoteGeoJson = values.remoteGeoJSON
  }

  if (values.dataSource === 'localGeoJSON' && values.localGeoJSON) {
    const text = await values.localGeoJSON.text()
    data.localGeoJSON = JSON.parse(text) as unknown
    if (values.dataOriginDate) {
      ;(data as Record<string, unknown>).dataOriginDate = values.dataOriginDate
    }
  }

  return data
}

export const CreateChallengeFormProvider = ({
  children,
  projectId,
}: {
  children: ReactNode
  projectId?: number
}) => {
  const navigate = useNavigate()
  const { data: projects } = api.project.getManagedProjects({ limit: 100 })
  const createChallengeMutation = api.challenge.useCreateChallenge()

  const onSubmit = useCallback(
    async (values: ChallengeFormValues) => {
      const selectedProjectId = values.projectId
      if (!selectedProjectId) {
        throw new Error('Project ID is required to create a challenge')
      }

      const challengeData = await buildChallengeData(values, true)

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
    },
    [createChallengeMutation, navigate]
  )

  const onCancel = useCallback(() => {
    if (projectId) {
      navigate({ to: '/manage/project/$projectId', params: { projectId: projectId.toString() } })
    } else {
      navigate({ to: '/manage/challenges' })
    }
  }, [navigate, projectId])

  const value = useMemo<ChallengeFormContextType>(
    () => ({ projectId, projects, isLoading: false, onSubmit, onCancel }),
    [projectId, projects, onSubmit, onCancel]
  )

  return <ChallengeFormContext.Provider value={value}>{children}</ChallengeFormContext.Provider>
}

export const EditChallengeFormProvider = ({
  children,
  challengeId,
}: {
  children: ReactNode
  challengeId: number
}) => {
  const navigate = useNavigate()
  const { data: challenge, isLoading } = api.challenge.getChallenge(challengeId)
  const updateChallengeMutation = api.challenge.useUpdateChallenge()

  const onSubmit = useCallback(
    async (values: ChallengeFormValues) => {
      const updateData = await buildChallengeData(values, false)

      await updateChallengeMutation.mutateAsync({
        challengeId,
        updates: updateData,
      })

      navigate({
        to: '/manage/challenge/$challengeId',
        params: { challengeId: String(challengeId) },
      })
    },
    [challengeId, navigate, updateChallengeMutation]
  )

  const onCancel = useCallback(() => {
    navigate({
      to: '/manage/challenge/$challengeId',
      params: { challengeId: String(challengeId) },
    })
  }, [challengeId, navigate])

  const value = useMemo<ChallengeFormContextType>(
    () => ({
      challenge,
      projectId: challenge?.parent,
      isLoading,
      onSubmit,
      onCancel,
    }),
    [challenge, isLoading, onSubmit, onCancel]
  )

  return <ChallengeFormContext.Provider value={value}>{children}</ChallengeFormContext.Provider>
}

export const useChallengeFormContext = () => {
  const context = useContext(ChallengeFormContext)
  if (!context) {
    throw new Error('useChallengeFormContext must be used within a ChallengeFormProvider')
  }
  return context
}
