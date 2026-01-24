import { mutationOptions, queryOptions, useMutation, useQuery } from '@tanstack/react-query'
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

  markNotificationsAsRead: (userId: number, notificationIds: number[]) =>
    useMutation(
      mutationOptions({
        mutationFn: () =>
          apiRequest
            .put(`api/v2/user/${userId}/notifications`, {
              json: { notificationIds },
            })
            .json<User>(),
      })
    ),

  markNotificationsAsUnread: (userId: number, notificationIds: number[]) =>
    useMutation(
      mutationOptions({
        mutationFn: () =>
          apiRequest
            .put(`api/v2/user/${userId}/notifications/unread`, {
              json: { notificationIds },
            })
            .json<User>(),
      })
    ),

  deleteNotifications: (userId: number, notificationIds: number[]) =>
    useMutation(
      mutationOptions({
        mutationFn: () =>
          apiRequest
            .put(`api/v2/user/${userId}/notifications/delete`, {
              json: { notificationIds },
            })
            .json<User>(),
      })
    ),
}
