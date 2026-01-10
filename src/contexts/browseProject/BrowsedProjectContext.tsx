import { useLoaderData } from '@tanstack/react-router'
import { createContext, type ReactNode, useContext } from 'react'
import type { Project } from '@/types/Project'

type BrowsedProjectContextType = {
  project: Project
}

const BrowsedProjectContext = createContext<BrowsedProjectContextType | undefined>(undefined)

export const BrowsedProjectProvider = ({ children }: { children: ReactNode }) => {
  const loaderData = useLoaderData({ from: '/_app/project/$projectId/' })

  if (!loaderData) {
    throw new Error('Project data not found')
  }

  const { project }: { project: Project } = loaderData

  const value: BrowsedProjectContextType = { project }
  return <BrowsedProjectContext.Provider value={value}>{children}</BrowsedProjectContext.Provider>
}

export const useBrowsedProjectContext = () => {
  const context = useContext(BrowsedProjectContext)

  if (context === undefined) {
    throw new Error('useBrowsedProject must be used within a BrowsedProjectProvider')
  }

  return context
}
