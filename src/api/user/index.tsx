import { userAdmin } from './admin'
import { userAuth } from './auth'
import { userNotifications } from './notifications'
import { userProfile } from './profile'

export const user = {
  ...userAuth,
  ...userProfile,
  ...userNotifications,
  ...userAdmin,
}
