import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useState } from 'react'
import { toast } from 'sonner'
import type { Task } from '@/types/Task'

export interface TaskBundle {
  bundleId: number
  taskIds: number[]
  tasks?: Task[]
  name: string
}

export interface TaskBundleContextType {
  activeBundle: TaskBundle | null
  setActiveBundle: Dispatch<SetStateAction<TaskBundle | null>>
  initialBundle: TaskBundle | null
  setInitialBundle: Dispatch<SetStateAction<TaskBundle | null>>
  showBundleOnly: boolean
  setShowBundleOnly: Dispatch<SetStateAction<boolean>>
  bundleEditsDisabled: boolean
  setBundleEditsDisabled: Dispatch<SetStateAction<boolean>>
  bundlingDisabledReason: string | null
  setBundlingDisabledReason: Dispatch<SetStateAction<string | null>>
  visibleTaskIds: number[] | null
  setVisibleTaskIds: Dispatch<SetStateAction<number[] | null>>
  clearBundle: () => void
  resetBundle: () => void
  showDeleteDialog: boolean
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>
  handleClearBundle: () => void
}

const TaskBundleContext = createContext<TaskBundleContextType | undefined>(undefined)

export const TaskBundleProvider = ({ children }: { children: ReactNode }) => {
  const [activeBundle, setActiveBundle] = useState<TaskBundle | null>(null)
  const [initialBundle, setInitialBundle] = useState<TaskBundle | null>(null)
  const [showBundleOnly, setShowBundleOnly] = useState(false)
  const [bundleEditsDisabled, setBundleEditsDisabled] = useState(false)
  const [bundlingDisabledReason, setBundlingDisabledReason] = useState<string | null>(null)
  const [visibleTaskIds, setVisibleTaskIds] = useState<number[] | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const clearBundle = () => {
    setActiveBundle(null)
    // Note: Don't clear initialBundle - it should persist based on the primary task's original bundle
    setShowBundleOnly(false)
    setVisibleTaskIds(null)
  }

  const resetBundle = () => {
    if (initialBundle) {
      setActiveBundle(initialBundle)
    }
  }

  const handleClearBundle = () => {
    if (!activeBundle) return
    clearBundle()
    toast.success('Now working on only the primary task')
    setShowDeleteDialog(false)
  }

  const value: TaskBundleContextType = {
    activeBundle,
    setActiveBundle,
    initialBundle,
    setInitialBundle,
    showBundleOnly,
    setShowBundleOnly,
    bundleEditsDisabled,
    setBundleEditsDisabled,
    bundlingDisabledReason,
    setBundlingDisabledReason,
    visibleTaskIds,
    setVisibleTaskIds,
    clearBundle,
    resetBundle,
    showDeleteDialog,
    setShowDeleteDialog,
    handleClearBundle,
  }

  return <TaskBundleContext.Provider value={value}>{children}</TaskBundleContext.Provider>
}

export const useTaskBundleContext = () => {
  const context = useContext(TaskBundleContext)
  if (context === undefined) {
    throw new Error('useTaskBundleContext must be used within a TaskBundleProvider')
  }
  return context
}
