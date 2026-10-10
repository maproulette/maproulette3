import { queryOptions, useQuery } from '@tanstack/react-query'
import type { ActivityItem } from '@/types/Activity'
import { apiRequest } from '../client'

export const userFollowedActivity = {
  /**
   * Recent activity from the given mappers, newest first. Identified by OSM id
   * rather than MapRoulette id, which is what the endpoint takes.
   */
  followedActivity: (osmIds: number[], options?: { enabled?: boolean; limit?: number }) =>
    useQuery(
      queryOptions({
        queryKey: ['user', 'followedActivity', [...osmIds].sort((a, b) => a - b), options?.limit],
        queryFn: () =>
          apiRequest
            .get('api/v2/data/user/activity', {
              searchParams: {
                osmUserIds: osmIds.join(','),
                limit: options?.limit ?? 50,
                offset: 0,
                includeDetails: true,
              },
            })
            .json<ActivityItem[]>(),
        // Nothing else in the app depends on this, so a failure should stay
        // quiet rather than retrying.
        retry: false,
        enabled: (options?.enabled ?? true) && osmIds.length > 0,
      })
    ),
}
