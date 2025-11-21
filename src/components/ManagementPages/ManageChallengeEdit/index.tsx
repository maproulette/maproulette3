import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { challenge as challengeApi } from '@/api/challenge'
import { AuthGuard } from '@/components/shared'
import { ChallengeForm, type ChallengeFormValues } from '@/components/shared/ChallengeForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export const ManageChallengeEdit = () => {
  const { challengeId } = useParams({ from: '/_app/manage/challenge/$challengeId/edit' })
  const navigate = useNavigate()

  const { data: challengeData, isLoading: isLoadingChallenge } = useSuspenseQuery(
    challengeApi.getChallenge(Number(challengeId))
  )

  const handleSubmit = async (values: ChallengeFormValues) => {
    console.log('Updating challenge:', challengeId, values)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    navigate({
      to: '/manage/challenge/$challengeId',
      params: { challengeId },
    })
  }

  const handleCancel = () => {
    navigate({
      to: '/manage/challenge/$challengeId',
      params: { challengeId },
    })
  }

  return (
    <AuthGuard>
      <div className="container">
        <Link
          to="/manage/challenge/$challengeId"
          params={{ challengeId }}
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Challenge
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl text-zinc-900 dark:text-zinc-50">
            {isLoadingChallenge ? <Skeleton className="h-9 w-96" /> : `Edit ${challengeData?.name}`}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">Update the challenge information below</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Challenge Details</CardTitle>
            <CardDescription>Modify the information below to update your challenge</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingChallenge ? (
              <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <ChallengeForm
                challenge={challengeData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
