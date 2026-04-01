import type { ReactNode } from 'react'
import { useAuthContext } from '@/components/AuthContext'
import { SignIn } from '@/components/SignIn'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { user } = useAuthContext()

  if (!user) {
    return fallback || <SignIn />
  }

  return <>{children}</>
}
