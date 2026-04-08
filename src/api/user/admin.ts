import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import type { GetAllUsersParams, User } from '@/types/User'
import { apiRequest, convertParamsToSearchParams } from '../'

export const userAdmin = {
  getAllUsers: (params?: GetAllUsersParams) => {
    const queryClient = useQueryClient()
    return useQuery(
      queryOptions({
        queryKey: ['user', 'all', params],
        queryFn: async () => {
          const users = await apiRequest
            .get('api/v2/super-admin/users', {
              searchParams: convertParamsToSearchParams({
                limit: params?.limit ?? 50,
                page: params?.page ?? 0,
              }),
            })
            .json<User[]>()
          for (const user of users) {
            queryClient.setQueryData(['user', user.id], user)
          }
          return users
        },
      })
    )
  },

  getSuperUsers: () =>
    useQuery(
      queryOptions({
        queryKey: ['user', 'superusers'],
        queryFn: () => apiRequest.get('api/v2/superusers').json<number[]>(),
      })
    ),
}
