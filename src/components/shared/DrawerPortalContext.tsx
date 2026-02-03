import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface DrawerPortalContextType {
  portalTarget: HTMLDivElement | null
  setPortalTarget: (el: HTMLDivElement | null) => void
}

const DrawerPortalContext = createContext<DrawerPortalContextType | null>(null)

export const DrawerPortalProvider = ({ children }: { children: ReactNode }) => {
  const [portalTarget, setPortalTarget] = useState<HTMLDivElement | null>(null)
  return (
    <DrawerPortalContext.Provider value={{ portalTarget, setPortalTarget }}>
      {children}
    </DrawerPortalContext.Provider>
  )
}

export const useDrawerPortal = () => {
  const ctx = useContext(DrawerPortalContext)
  if (!ctx) throw new Error('useDrawerPortal must be used within DrawerPortalProvider')
  return ctx
}

/** Attach this as a ref callback on the div where the drawer should render */
export const DrawerPortalTarget = () => {
  const { setPortalTarget } = useDrawerPortal()
  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      setPortalTarget(el)
    },
    [setPortalTarget]
  )
  return <div ref={ref} />
}
