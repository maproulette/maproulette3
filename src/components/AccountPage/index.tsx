import { useAuthContext } from '@/contexts/AuthContext'
import { AuthGuard } from '../shared/AuthGuard'
import { UserSettingsForm } from './UserSettingsForm'

export const Account = () => {
  const { user } = useAuthContext()

  return (
    <AuthGuard>
      <div className="px-4 pt-24 md:pt-32">
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
