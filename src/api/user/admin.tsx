import { queryOptions, useQuery } from '@tanstack/react-query'
import type { GetAllUsersParams, User } from '@/types/User'
import { apiRequest, convertParamsToSearchParams } from '../'

export const userAdmin = {
  getAllUsers: (params?: GetAllUsersParams) =>
    useQuery(
      queryOptions({
        queryKey: ['users', 'all', params],
        queryFn: () =>
          apiRequest
            .get('api/v2/super-admin/users', {
              searchParams: convertParamsToSearchParams({
                limit: params?.limit ?? 50,
                page: params?.page ?? 0,
              }),
            })
            .json<User[]>(),
      })
    ),

  getSuperUsers: () =>
    useQuery(
      queryOptions({
        queryKey: ['users', 'superusers'],
        queryFn: () => apiRequest.get('api/v2/superusers').json<number[]>(),
      })
    ),
}
