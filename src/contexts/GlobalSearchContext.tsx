import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import type { SearchType } from '@/types/GlobalSearch'

interface SearchTypeOption {
  id: SearchType
  label: string
  description: string
  prefix: string
}

interface GlobalSearchContextType {
  searchQuery: string
  isOpen: boolean
  onResultSelect: () => void
  onSelectSearchType: (searchType: SearchTypeOption) => void
}

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined)

export const GlobalSearchProvider = ({
  children,
  searchQuery,
  isOpen,
  onResultSelect,
  onSelectSearchType,
}: {
  children: ReactNode
  searchQuery: string
  isOpen: boolean
  onResultSelect: () => void
  onSelectSearchType: (searchType: SearchTypeOption) => void
}) => {
  const value = useMemo<GlobalSearchContextType>(
    () => ({ searchQuery, isOpen, onResultSelect, onSelectSearchType }),
    [searchQuery, isOpen, onResultSelect, onSelectSearchType]
  )

  return <GlobalSearchContext.Provider value={value}>{children}</GlobalSearchContext.Provider>
}

export const useGlobalSearchContext = () => {
  const context = useContext(GlobalSearchContext)
  if (!context) {
    throw new Error('useGlobalSearchContext must be used within a GlobalSearchProvider')
  }
  return context
}
