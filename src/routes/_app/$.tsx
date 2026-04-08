import { createFileRoute, useLocation } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Loader } from '@/components/ui/Loader'
import type { PluginPageMatch } from '@/contexts/PluginContext'
import { usePluginContext } from '@/contexts/PluginContext'

/**
 * Catch-all route that handles plugin-defined custom routes
 * This allows plugins to register their own paths like:
 * - /example
 * - /tasks/:id/review
 * - /challenge/:challengeId/tasks/:taskId
 */
const DynamicPluginRoute = () => {
  const location = useLocation()
  const { getPluginPageByPath } = usePluginContext()
  const [pageMatch, setPageMatch] = useState<PluginPageMatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true)
      setError(null)

      try {
        const match = await getPluginPageByPath(location.pathname)
        if (match) {
          setPageMatch(match)
        } else {
          setError(`No plugin page found for path: ${location.pathname}`)
        }
      } catch (err) {
        console.error('Failed to load plugin page:', err)
        setError(err instanceof Error ? err.message : 'Failed to load plugin page')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [location.pathname, getPluginPageByPath])

  if (loading) {
    return <Loader isFullScreen message="Loading plugin page..." />
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!pageMatch) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>Page Not Found</AlertTitle>
          <AlertDescription>The requested plugin page could not be found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const PageComponent = pageMatch.page.component

  return (
    <div className="mx-auto px-4 py-8">
      <PageComponent params={pageMatch.params} />
    </div>
  )
}

export const Route = createFileRoute('/_app/$')({
  component: DynamicPluginRoute,
})
