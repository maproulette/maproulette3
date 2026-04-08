import { createContext, useContext, useEffect, useMemo, useState } from 'react'

interface PageTitleContextType {
  dynamicTitle: string | null
  setDynamicTitle: (title: string | null) => void
}

const PageTitleContext = createContext<PageTitleContextType>({
  dynamicTitle: null,
  setDynamicTitle: () => {},
})

export const PageTitleProvider = ({ children }: { children: React.ReactNode }) => {
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null)

  // Reason: context value must be stable to prevent all consumers from re-rendering
  const value = useMemo(() => ({ dynamicTitle, setDynamicTitle }), [dynamicTitle, setDynamicTitle])

  return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>
}

export const usePageTitleContext = () => useContext(PageTitleContext).dynamicTitle

export const useSetPageTitleContext = (title: string | null) => {
  const { setDynamicTitle } = useContext(PageTitleContext)

  useEffect(() => {
    setDynamicTitle(title)
    return () => setDynamicTitle(null)
  }, [title, setDynamicTitle])
}
