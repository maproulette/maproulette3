import { createContext, useContext, useEffect, useState } from 'react'

interface PageTitleContextValue {
  dynamicTitle: string | null
  setDynamicTitle: (title: string | null) => void
}

const PageTitleContext = createContext<PageTitleContextValue>({
  dynamicTitle: null,
  setDynamicTitle: () => {},
})

export const PageTitleProvider = ({ children }: { children: React.ReactNode }) => {
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null)

  return (
    <PageTitleContext.Provider value={{ dynamicTitle, setDynamicTitle }}>
      {children}
    </PageTitleContext.Provider>
  )
}

export const usePageTitle = () => useContext(PageTitleContext).dynamicTitle

export const useSetPageTitle = (title: string | null) => {
  const { setDynamicTitle } = useContext(PageTitleContext)

  useEffect(() => {
    setDynamicTitle(title)
    return () => setDynamicTitle(null)
  }, [title, setDynamicTitle])
}
