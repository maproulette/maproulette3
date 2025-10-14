import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Notification } from '@/types/Notification'
import type { User } from '@/types/User'

const whoAmIOptions = (isLoggedOut: boolean) =>
  queryOptions({
    queryKey: ['whoami'],
    queryFn: () => api.get('api/v2/user/whoami').json<User>(),
    enabled: !isLoggedOut,
    retry: false,
  })

const notificationOptions = (userId?: number) =>
  queryOptions({
    queryKey: ['user', userId, 'notifications'],
    queryFn: () => api.get(`api/v2/user/${userId}/notifications`).json<Notification[]>(),
    enabled: !!userId,
  })

export { whoAmIOptions, notificationOptions }
