import { useAuth } from '@/contexts/AuthContext'
import { UserSettingsForm } from './UserSettingsForm'
import { SignIn } from '../SignIn'

export const Account = () => {
  const { user } = useAuth()

  if (!user) {
    return <SignIn />
  }

  return (
    <div className="px-4 pt-24 md:pt-32">
      {/* 
        Need to pass this as prop because we dont want 
        useForm to run, and this way complies with react 
        hook rules 
      */}
      <UserSettingsForm user={user} />
    </div>
  )
}
