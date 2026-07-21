import { createFileRoute, useLocation } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Loader } from '@/components/ui/Loader'
import type { PluginPageMatch } from '@/contexts/PluginContext'
import { usePluginContext } from '@/contexts/PluginContext'
import { useIntl } from '@/i18n'
import { logger } from '@/lib/logger'

/**
 * Catch-all route that handles plugin-defined custom routes
 * This allows plugins to register their own paths like:
 * - /example
 * - /tasks/:id/review
 * - /challenge/:challengeId/tasks/:taskId
 */
const DynamicPluginRoute = () => {
  const { t } = useIntl()
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
          setError(
            t(
              'dynamicPluginRoute.noPageFound',
              { path: location.pathname },
              'No plugin page found for path: {path}'
            )
          )
        }
      } catch (err) {
        logger.error('Failed to load plugin page', { error: err })
        setError(
          err instanceof Error
            ? err.message
            : t('dynamicPluginRoute.loadFailed', undefined, 'Failed to load plugin page')
        )
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [location.pathname, getPluginPageByPath, t])

  if (loading) {
    return (
      <Loader
        isFullScreen
        message={t('dynamicPluginRoute.loading', undefined, 'Loading plugin page...')}
      />
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t('dynamicPluginRoute.errorTitle', undefined, 'Error')}</AlertTitle>
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
          <AlertTitle>{t('common.pageNotFound', undefined, 'Page Not Found')}</AlertTitle>
          <AlertDescription>
            {t(
              'dynamicPluginRoute.notFoundDescription',
              undefined,
              'The requested plugin page could not be found.'
            )}
          </AlertDescription>
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
