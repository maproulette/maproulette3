import { useMatches, useRouterState } from '@tanstack/react-router'
import { usePageTitle } from '@/components/PageTitleContext'

export const PageTitleBar = () => {
  const dynamicTitle = usePageTitle()
  const matches = useMatches()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // Only show on management pages
  const isAllowed = pathname.startsWith('/manage')

  if (!isAllowed) return null

  // Get the most specific route's staticData pageTitle
  const staticTitle = [...matches].reverse().find((match) => match.staticData?.pageTitle)
    ?.staticData?.pageTitle

  const title = dynamicTitle || staticTitle

  if (!title) return null

  return (
    <div className="px-4 pb-3">
      <h1 className="font-semibold text-foreground text-xl">{title}</h1>
    </div>
  )
}
