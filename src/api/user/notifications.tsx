import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { User, UserNotificationsParams, UserNotificationsResponse } from '@/types/User'
import { apiRequest, convertParamsToSearchParams } from '../'

export const userNotifications = {
  notification: (userId: number | undefined, params?: UserNotificationsParams) =>
    useQuery(
      queryOptions({
        queryKey: ['user', 'notifications', userId, params],
        queryFn: () =>
          apiRequest
            .get(`api/v2/user/${userId}/notifications`, {
              searchParams: convertParamsToSearchParams({ ...params }),
            })
            .json<UserNotificationsResponse>(),
        enabled: !!userId,
      })
    ),

  useMarkNotificationsAsRead: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ userId, notificationIds }: { userId: number; notificationIds: number[] }) =>
        apiRequest
          .put(`api/v2/user/${userId}/notifications`, {
            json: { notificationIds },
          })
          .json<User>(),
      onSuccess: (_data, variables) => {
        queryClient.setQueriesData<UserNotificationsResponse>(
          { queryKey: ['user', 'notifications', variables.userId] },
          (oldData) =>
            oldData?.map((n) =>
              variables.notificationIds.includes(n.id) ? { ...n, isRead: true } : n
            )
        )
      },
    })
  },

  useMarkNotificationsAsUnread: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ userId, notificationIds }: { userId: number; notificationIds: number[] }) =>
        apiRequest
          .put(`api/v2/user/${userId}/notifications/unread`, {
            json: { notificationIds },
          })
          .json<User>(),
      onSuccess: (_data, variables) => {
        queryClient.setQueriesData<UserNotificationsResponse>(
          { queryKey: ['user', 'notifications', variables.userId] },
          (oldData) =>
            oldData?.map((n) =>
              variables.notificationIds.includes(n.id) ? { ...n, isRead: false } : n
            )
        )
      },
    })
  },

  useDeleteNotifications: () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ userId, notificationIds }: { userId: number; notificationIds: number[] }) =>
        apiRequest
          .put(`api/v2/user/${userId}/notifications/delete`, {
            json: { notificationIds },
          })
          .json<User>(),
      onSuccess: (_data, variables) => {
        queryClient.setQueriesData<UserNotificationsResponse>(
          { queryKey: ['user', 'notifications', variables.userId] },
          (oldData) => oldData?.filter((n) => !variables.notificationIds.includes(n.id))
        )
      },
    })
  },
}
