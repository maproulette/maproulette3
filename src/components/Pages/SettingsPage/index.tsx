import { useAuthContext } from '@/contexts/AuthContext'
import { AuthGuard } from '@/lib/AuthGuard'
import { UserSettingsForm } from './UserSettingsForm'

export const SettingsPage = () => {
  const { user } = useAuthContext()

  return (
    <AuthGuard>
      <div className="px-4">
        {/* 
          Need to pass this as prop because we dont want 
          useForm to run, and this way complies with react 
          hook rules 
        */}
        {user && <UserSettingsForm user={user} />}
      </div>
    </AuthGuard>
  )
}
