import { Link } from '@tanstack/react-router'
import { HTTPError } from 'ky'
import { AlertCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { logger } from '@/components/logger'
import { Button } from '@/components/ui/Button'

interface RouteErrorBoundaryProps {
  error: Error
  reset?: () => void
}

/**
 * Route-level error boundary component that handles different error types
 * with appropriate UI and user guidance.
 *
 * Handles:
 * - 404 Not Found
 * - 403 Forbidden
 * - 401 Unauthorized
 * - 500 Server Errors
 * - Generic errors
 */
export function RouteErrorBoundary({ error, reset }: RouteErrorBoundaryProps) {
  // Log the error for debugging
  logger.error('Route error caught', {
    error: error.message,
    stack: error.stack,
  })

  // Handle HTTP errors from API
  if (error instanceof HTTPError) {
    const status = error.response.status

    switch (status) {
      case 404:
        return <NotFoundError reset={reset} />
      case 403:
        return <ForbiddenError reset={reset} />
      case 401:
        return <UnauthorizedError reset={reset} />
      case 500:
      case 502:
      case 503:
        return <ServerError error={error} reset={reset} />
      default:
        return <GenericHttpError error={error} reset={reset} />
    }
  }

  // Handle generic errors
  return <GenericError error={error} reset={reset} />
}

function NotFoundError({ reset: _reset }: { reset?: () => void }) {
  return (
    <ErrorLayout
      title="404 - Not Found"
      description="The page or resource you're looking for doesn't exist."
      icon={<AlertCircle className="h-16 w-16 text-yellow-500" />}
      actions={
        <>
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </>
      }
    />
  )
}

function ForbiddenError({ reset: _reset }: { reset?: () => void }) {
  return (
    <ErrorLayout
      title="403 - Forbidden"
      description="You don't have permission to access this resource."
      icon={<AlertCircle className="h-16 w-16 text-orange-500" />}
      actions={
        <>
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </>
      }
    />
  )
}

function UnauthorizedError({ reset: _reset }: { reset?: () => void }) {
  return (
    <ErrorLayout
      title="401 - Unauthorized"
      description="You need to be logged in to access this resource."
      icon={<AlertCircle className="h-16 w-16 text-red-500" />}
      actions={
        <Link to="/">
          <Button>
            <Home className="mr-2 h-4 w-4" />
            Go to Login
          </Button>
        </Link>
      }
    />
  )
}

function ServerError({ error, reset }: { error: HTTPError; reset?: () => void }) {
  return (
    <ErrorLayout
      title="Server Error"
      description="The server encountered an error. Please try again later."
      icon={<AlertCircle className="h-16 w-16 text-red-500" />}
      details={
        import.meta.env.DEV ? (
          <pre className="mt-4 max-w-2xl overflow-auto rounded bg-gray-100 p-4 text-left text-sm dark:bg-gray-800">
            {error.message}
          </pre>
        ) : undefined
      }
      actions={
        <>
          {reset && (
            <Button onClick={reset} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </>
      }
    />
  )
}

function GenericHttpError({ error, reset }: { error: HTTPError; reset?: () => void }) {
  return (
    <ErrorLayout
      title={`Error ${error.response.status}`}
      description="An unexpected error occurred while loading this page."
      icon={<AlertCircle className="h-16 w-16 text-red-500" />}
      details={
        import.meta.env.DEV ? (
          <pre className="mt-4 max-w-2xl overflow-auto rounded bg-gray-100 p-4 text-left text-sm dark:bg-gray-800">
            {error.message}
          </pre>
        ) : undefined
      }
      actions={
        <>
          {reset && (
            <Button onClick={reset} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </>
      }
    />
  )
}

function GenericError({ error, reset }: { error: Error; reset?: () => void }) {
  return (
    <ErrorLayout
      title="Something went wrong"
      description="An unexpected error occurred. Please try again."
      icon={<AlertCircle className="h-16 w-16 text-red-500" />}
      details={
        import.meta.env.DEV ? (
          <pre className="mt-4 max-w-2xl overflow-auto rounded bg-gray-100 p-4 text-left text-sm dark:bg-gray-800">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        ) : undefined
      }
      actions={
        <>
          {reset && (
            <Button onClick={reset} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </>
      }
    />
  )
}

interface ErrorLayoutProps {
  title: string
  description: string
  icon: React.ReactNode
  details?: React.ReactNode
  actions: React.ReactNode
}

function ErrorLayout({ title, description, icon, details, actions }: ErrorLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-4 flex justify-center">{icon}</div>
        <h1 className="mb-2 font-bold text-3xl">{title}</h1>
        <p className="mb-6 text-muted-foreground">{description}</p>
        {details}
        <div className="mt-6 flex justify-center gap-4">{actions}</div>
      </div>
    </div>
  )
}
