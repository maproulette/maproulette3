import { type ComponentType, lazy, Suspense } from 'react'
import { Loader } from '@/components/ui/Loader'

/**
 * Lazy load a component with automatic Suspense boundary
 *
 * @param importFunc - Dynamic import function
 * @param fallback - Optional custom loading component
 * @returns Lazy loaded component wrapped with Suspense
 *
 * @example
 * ```tsx
 * // Basic usage
 * const SuperAdminPage = lazyLoad(() => import('@/components/SuperAdminPages'))
 *
 * // Custom loading fallback
 * const HeavyChart = lazyLoad(
 *   () => import('@/components/HeavyChart'),
 *   <div>Loading chart...</div>
 * )
 *
 * // Use in routes
 * export const Route = createFileRoute('/admin')({
 *   component: SuperAdminPage,
 * })
 * ```
 */
export const lazyLoad = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback: React.ReactNode = <Loader isFullScreen />,
): React.FC<P> => {
  const LazyComponent = lazy(importFunc)

  const LazyWrapper = (props: P) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )

  return LazyWrapper
}

/**
 * Preload a lazy component before it's rendered
 * Useful for prefetching on user interaction (hover, etc.)
 *
 * @param importFunc - The same import function used in lazyLoad
 *
 * @example
 * ```tsx
 * const AdminPage = lazyLoad(() => import('./AdminPage'))
 *
 * // Prefetch on hover
 * <Link
 *   to="/admin"
 *   onMouseEnter={() => preloadComponent(() => import('./AdminPage'))}
 * >
 *   Admin
 * </Link>
 * ```
 */
export const preloadComponent = <T,>(importFunc: () => Promise<{ default: T }>): void => {
  importFunc()
}

/**
 * Create a lazy route component
 * Specifically designed for TanStack Router route components
 *
 * @example
 * ```tsx
 * export const Route = createFileRoute('/heavy-page')({
 *   component: lazyRoute(() => import('./HeavyPage')),
 * })
 * ```
 */
export const lazyRoute = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
): React.FC<P> => lazyLoad(importFunc, <Loader isFullScreen />)
