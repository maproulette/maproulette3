import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { RouteErrorBoundary } from '@/components/Pages/ErrorBoundary/RouteErrorBoundary'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  errorComponent: RouteErrorBoundary,
  head: () => ({
    meta: [
      {
        title: import.meta.env.VITE_APP_NAME,
      },
      {
        name: 'description',
        content: import.meta.env.VITE_APP_DESCRIPTION,
      },
    ],
  }),
  component: () => {
    const disableDevtools = import.meta.env.VITE_DISABLE_DEVTOOLS === 'true'

    if (disableDevtools) {
      return (
        <>
          <HeadContent />
          <Outlet />
          <Scripts />
        </>
      )
    }

    return (
      <>
        <HeadContent />
        <Outlet />
        <Scripts />
        <TanStackDevtools
          config={{
            position: 'bottom-left',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <ReactQueryDevtools buttonPosition="bottom-right" />
      </>
    )
  },
})
