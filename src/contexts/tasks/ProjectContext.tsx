import { createContext, useContext, type ReactNode } from 'react'
import { api } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { useChallengeContext } from './ChallengeContext'
import type { Project } from '@/types/Project'

type ProjectContextType = {
  project: Project | undefined
  projectLoading: boolean
  projectError: Error | null
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { challenge } = useChallengeContext()
  const { data, isLoading, error } = useQuery(api.project.getProject(challenge?.parent))

  const value: ProjectContextType = {
    project: data,
    projectLoading: isLoading,
    projectError: error,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export const useProjectContext = (): ProjectContextType => {
  const context = useContext(ProjectContext)

  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }

  return context
}
