import { useAuth } from '@/contexts/AuthContext'
import { Loader } from '@/components/ui/Loader'

export const DashboardPage = () => {
  const { isLoading, user } = useAuth()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="font-bold text-4xl">Welcome!</h1>
        {isLoading ? (
          <Loader />
        ) : (
          <div className="font-mono text-sm text-zinc-500">
            {user ? (
              <p>You are logged in as {user.osmProfile.displayName}</p>
            ) : (
              <p>Please log in to continue.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
