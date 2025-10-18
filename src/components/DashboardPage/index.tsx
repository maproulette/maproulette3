import { SignIn } from '@/components/SignIn'
import { useAuth } from '@/contexts/AuthContext'

export const Dashboard = () => {
  const { user } = useAuth()

  if (!user) {
    return <SignIn />
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="font-bold text-4xl">Welcome!</h1>
        <div className="font-mono text-sm text-zinc-500">
          <p>You are logged in as {user.osmProfile.displayName}</p>
        </div>
      </div>
    </div>
  )
}
