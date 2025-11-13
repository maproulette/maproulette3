import { useParams } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Loader } from '@/components/ui/Loader'
import { usePluginContext } from '@/contexts/PluginContext'
import type { PluginPage as PluginPageType } from '@/types/Plugin'

/**
 * Generic page component that renders plugin pages
 * Route: /plugin/:pluginId/:pageId
 */
export const PluginPage = () => {
  const { pluginId, pageId } = useParams({ strict: false })
  const { getPluginPage, isPluginEnabled } = usePluginContext()
  const [page, setPage] = useState<PluginPageType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPage = async () => {
      if (!pluginId || !pageId) {
        setError('Invalid plugin page URL')
        setLoading(false)
        return
      }

      if (!isPluginEnabled(pluginId)) {
        setError('This plugin is not enabled. Please enable it in your account settings.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const pluginPage = await getPluginPage(pluginId, pageId)
        if (pluginPage) {
          setPage(pluginPage)
        } else {
          setError(`Page "${pageId}" not found in plugin "${pluginId}"`)
        }
      } catch (err) {
        console.error('Failed to load plugin page:', err)
        setError(err instanceof Error ? err.message : 'Failed to load plugin page')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [pluginId, pageId, getPluginPage, isPluginEnabled])

  if (loading) {
    return <Loader isFullScreen message="Loading plugin page..." />
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>Page Not Found</AlertTitle>
          <AlertDescription>The requested plugin page could not be found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const PageComponent = page.component

  return (
    <div className="container mx-auto px-4 py-8">
      <PageComponent />
    </div>
  )
}
