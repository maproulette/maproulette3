import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, ErrorComponent, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Import main css
import './main.css'
import { NotFound } from '@/components/NotFound'

// Web Vitals (optional)
// import reportWebVitals from './reportWebVitals.ts'

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          typeof error.status === 'number'
        ) {
          if (error.status >= 400 && error.status < 500) {
            return false
          }
        }
        return failureCount < 3
      },
    },
  },
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: () => {
    return <NotFound />
  },
  defaultErrorComponent: ErrorComponent,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app with required providers
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()
