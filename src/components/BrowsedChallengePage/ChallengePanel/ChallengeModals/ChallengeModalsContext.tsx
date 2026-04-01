import { createContext, useContext, useState } from 'react'

interface ChallengeModalsContextType {
  isReportModalOpen: boolean
  isCommentsModalOpen: boolean
  isOverpassModalOpen: boolean
  isCloneModalOpen: boolean
  isActionsModalOpen: boolean
  openReport: () => void
  openComments: () => void
  openOverpass: () => void
  openClone: () => void
  openActions: () => void
  closeReport: () => void
  closeComments: () => void
  closeOverpass: () => void
  closeClone: () => void
  closeActions: () => void
  setReportOpen: (open: boolean) => void
  setCommentsOpen: (open: boolean) => void
  setOverpassOpen: (open: boolean) => void
  setCloneOpen: (open: boolean) => void
  setActionsOpen: (open: boolean) => void
}

const ChallengeModalsContext = createContext<ChallengeModalsContextType | undefined>(undefined)

export const useChallengeModals = () => {
  const context = useContext(ChallengeModalsContext)
  if (!context) {
    throw new Error('useChallengeModals must be used within ChallengeModalsProvider')
  }
  return context
}

export const ChallengeModalsProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [isOverpassModalOpen, setIsOverpassModalOpen] = useState(false)
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false)

  return (
    <ChallengeModalsContext.Provider
      value={{
        isReportModalOpen,
        isCommentsModalOpen,
        isOverpassModalOpen,
        isCloneModalOpen,
        isActionsModalOpen,
        openReport: () => setIsReportModalOpen(true),
        openComments: () => setIsCommentsModalOpen(true),
        openOverpass: () => setIsOverpassModalOpen(true),
        openClone: () => setIsCloneModalOpen(true),
        openActions: () => setIsActionsModalOpen(true),
        closeReport: () => setIsReportModalOpen(false),
        closeComments: () => setIsCommentsModalOpen(false),
        closeOverpass: () => setIsOverpassModalOpen(false),
        closeClone: () => setIsCloneModalOpen(false),
        closeActions: () => setIsActionsModalOpen(false),
        setReportOpen: setIsReportModalOpen,
        setCommentsOpen: setIsCommentsModalOpen,
        setOverpassOpen: setIsOverpassModalOpen,
        setCloneOpen: setIsCloneModalOpen,
        setActionsOpen: setIsActionsModalOpen,
      }}
    >
      {children}
    </ChallengeModalsContext.Provider>
  )
}
