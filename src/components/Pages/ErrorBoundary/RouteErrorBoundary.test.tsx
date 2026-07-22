import userEvent from '@testing-library/user-event'
import { HTTPError, type NormalizedOptions } from 'ky'
import { Component, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@/test/testUtils'

interface LinkMockProps {
  to: string
  children?: ReactNode
}

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: LinkMockProps) => <a href={to}>{children}</a>,
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { logger } from '@/lib/logger'
import { RouteErrorBoundary } from './RouteErrorBoundary'

const makeHttpError = (status: number, statusText = 'Error') =>
  new HTTPError(
    new Response(null, { status, statusText }),
    new Request('https://example.test/api/resource'),
    {} as unknown as NormalizedOptions
  )

// A minimal error boundary that mirrors how TanStack Router actually wires
// `RouteErrorBoundary` up in this app (see src/routes/__root.tsx, which sets
// `errorComponent: RouteErrorBoundary`): the router itself catches errors
// thrown during rendering/loading and passes them to the error component as
// props. `RouteErrorBoundary` is a plain function component, not a class with
// `componentDidCatch`, so to verify it behaves correctly when wired up as a
// real error boundary we reproduce that wiring locally.
class TestRouteErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  override state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  reset = () => this.setState({ error: null })

  override render() {
    if (this.state.error) {
      return <RouteErrorBoundary error={this.state.error} reset={this.reset} />
    }
    return this.props.children
  }
}

const ThrowingChild = (): never => {
  throw new Error('Boom from child')
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('RouteErrorBoundary as a real error boundary', () => {
  it('catches an error thrown by a child component and renders the fallback UI', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <TestRouteErrorBoundary>
        <ThrowingChild />
      </TestRouteErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.queryByText('Boom from child')).toBeNull()

    consoleErrorSpy.mockRestore()
  })

  it('logs the caught error rather than silently swallowing it', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <TestRouteErrorBoundary>
        <ThrowingChild />
      </TestRouteErrorBoundary>
    )

    expect(logger.error).toHaveBeenCalledWith(
      'Route error caught',
      expect.objectContaining({ error: 'Boom from child' })
    )

    consoleErrorSpy.mockRestore()
  })

  it('does not interfere with normal rendering when no error occurs', () => {
    render(
      <TestRouteErrorBoundary>
        <div>All good</div>
      </TestRouteErrorBoundary>
    )

    expect(screen.getByText('All good')).toBeDefined()
    expect(screen.queryByText('Something went wrong')).toBeNull()
  })

  it('recovers and re-renders children after reset() is called', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    let shouldThrow = true
    const MaybeThrows = () => {
      if (shouldThrow) throw new Error('Boom from child')
      return <div>Recovered</div>
    }

    render(
      <TestRouteErrorBoundary>
        <MaybeThrows />
      </TestRouteErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeDefined()

    shouldThrow = false
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(screen.getByText('Recovered')).toBeDefined()
    consoleErrorSpy.mockRestore()
  })
})

describe('RouteErrorBoundary rendering by error type', () => {
  it('renders the 404 not found UI', () => {
    render(<RouteErrorBoundary error={makeHttpError(404)} />)

    expect(screen.getByText('404 - Not Found')).toBeDefined()
    expect(
      screen.getByText("The page or resource you're looking for doesn't exist.")
    ).toBeDefined()
  })

  it('renders the 403 forbidden UI', () => {
    render(<RouteErrorBoundary error={makeHttpError(403)} />)

    expect(screen.getByText('403 - Forbidden')).toBeDefined()
  })

  it('renders the 401 unauthorized UI with a login link instead of a back/home pair', () => {
    render(<RouteErrorBoundary error={makeHttpError(401)} />)

    expect(screen.getByText('401 - Unauthorized')).toBeDefined()
    expect(screen.getByRole('link', { name: /go to login/i })).toBeDefined()
    expect(screen.queryByRole('button', { name: /go back/i })).toBeNull()
  })

  it.each([500, 502, 503])('renders the server error UI for status %i', (status) => {
    render(<RouteErrorBoundary error={makeHttpError(status)} />)

    expect(screen.getByText('Server Error')).toBeDefined()
  })

  it('renders a generic HTTP error UI with the status code for other statuses', () => {
    render(<RouteErrorBoundary error={makeHttpError(418)} />)

    expect(screen.getByText('Error 418')).toBeDefined()
  })

  it('renders the generic error UI for a plain (non-HTTP) Error', () => {
    render(<RouteErrorBoundary error={new Error('Something exploded')} />)

    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(
      screen.getByText('An unexpected error occurred. Please try again.')
    ).toBeDefined()
  })

  it('shows a "Try Again" button that calls reset() only when reset is provided', async () => {
    const resetMock = vi.fn()
    render(<RouteErrorBoundary error={new Error('boom')} reset={resetMock} />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(resetMock).toHaveBeenCalledTimes(1)
  })

  it('omits the "Try Again" button when no reset function is provided', () => {
    render(<RouteErrorBoundary error={new Error('boom')} />)

    expect(screen.queryByRole('button', { name: /try again/i })).toBeNull()
  })

  it('always renders a link back home', () => {
    render(<RouteErrorBoundary error={new Error('boom')} />)

    const homeLink = screen.getByRole('link', { name: /go home/i })
    expect(homeLink.getAttribute('href')).toBe('/')
  })

  it('logs every caught error via the logger rather than swallowing it', () => {
    render(<RouteErrorBoundary error={new Error('logged-error')} />)

    expect(logger.error).toHaveBeenCalledWith(
      'Route error caught',
      expect.objectContaining({ error: 'logged-error' })
    )
  })
})
