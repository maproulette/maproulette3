import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        title: 'MapRoulette',
      },
      {
        name: 'description',
        content: 'MapRoulette - Mapping for a better world',
      },
    ],
  }),
  component: () => (
    <>
      <HeadContent />
      <Outlet />
      <Scripts />
    </>
  ),
});
