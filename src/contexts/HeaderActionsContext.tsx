import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

interface HeaderActionsContextValue {
  actions: ReactNode | null
  setActions: (actions: ReactNode | null) => void
}

const HeaderActionsContext = createContext<HeaderActionsContextValue>({
  actions: null,
  setActions: () => {},
})

export const HeaderActionsProvider = ({ children }: { children: ReactNode }) => {
  const [actions, setActions] = useState<ReactNode | null>(null)

  // Reason: context value must be stable to prevent all consumers from re-rendering
  const value = useMemo(() => ({ actions, setActions }), [actions, setActions])

  return <HeaderActionsContext.Provider value={value}>{children}</HeaderActionsContext.Provider>
}

export const useHeaderActions = () => useContext(HeaderActionsContext).actions

export const useSetHeaderActions = (actions: ReactNode | null) => {
  const { setActions } = useContext(HeaderActionsContext)
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  useEffect(() => {
    setActions(actionsRef.current)
    return () => setActions(null)
  }, [setActions])
}
