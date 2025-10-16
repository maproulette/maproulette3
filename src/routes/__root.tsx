import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
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
    const showDevtools = import.meta.env.VITE_SHOW_DEVTOOLS === 'true'

    return (
      <>
        <HeadContent />
        <Outlet />
        <Scripts />
        {showDevtools && (
          <>
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
        )}
      </>
    )
  },
})
