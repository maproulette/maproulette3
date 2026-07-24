import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { apiRequest } from '../client'

export interface ChallengeReportStatus {
  enabled: boolean
  existingIssue: { html_url: string } | null
}

export interface ChallengeReportResult {
  issueUrl: string | null
}

export const challengeReport = {
  useReportStatus: (challengeId: number) =>
    useQuery(
      queryOptions({
        queryKey: ['challenge', 'reportStatus', challengeId],
        queryFn: () =>
          apiRequest.get(`api/v2/challenge/${challengeId}/report/status`).json<ChallengeReportStatus>(),
        enabled: !!challengeId,
      })
    ),

  useSubmitChallengeReport: () =>
    useMutation({
      mutationFn: ({ challengeId, reportText }: { challengeId: number; reportText: string }) =>
        apiRequest
          .post(`api/v2/challenge/${challengeId}/report`, {
            json: { reportText },
          })
          .json<ChallengeReportResult>(),
    }),
}
