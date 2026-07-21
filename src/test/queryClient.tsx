import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function renderHookWithClient<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: { client?: QueryClient; initialProps?: TProps } = {}
) {
  const client = options.client ?? createTestQueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return {
    ...renderHook(hook, { wrapper, initialProps: options.initialProps }),
    queryClient: client,
  }
}
