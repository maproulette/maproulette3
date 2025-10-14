import { createFileRoute } from '@tanstack/react-router'
import { Loader } from '@/components/ui/Loader'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/_app/dashboard')({
  head: () => ({
    meta: [
      {
        title: 'Welcome',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
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
