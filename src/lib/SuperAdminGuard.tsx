import { Navigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useIntl } from '@/i18n'
import type { User } from '@/types/User'

interface SuperAdminGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Check if user has super admin privileges
 * Super users have a grant with role = -1 (ROLE_SUPER_USER)
 */
export const isSuperUser = (user: User | null | undefined): boolean => {
  if (!user) return false
  return user.grants?.some((grant) => grant.role === -1) ?? false
}

export const SuperAdminGuard = ({ children, fallback }: SuperAdminGuardProps) => {
  const { user } = useAuthContext()
  const { t } = useIntl()

  if (!user) {
    return <Navigate to="/" />
  }

  if (!isSuperUser(user)) {
    return (
      fallback || (
        <div className="mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 font-bold text-3xl text-zinc-900 dark:text-zinc-50">
            {t('superAdminGuard.accessDenied.title', undefined, 'Access Denied')}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {t(
              'superAdminGuard.accessDenied.message',
              undefined,
              'You do not have permission to access this area. Super admin privileges are required.'
            )}
          </p>
        </div>
      )
    )
  }

  return <>{children}</>
}
