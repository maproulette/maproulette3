import { AuthGuard } from '@/components/shared/AuthGuard'
import { BackLink } from '@/components/ui/BackLink'
import { Skeleton } from '@/components/ui/Skeleton'

interface ManageFormLayoutProps {
  backTo: string
  backParams?: Record<string, string>
  backLabel: string
  pageTitle: string
  pageDescription: string
  cardTitle: string
  cardDescription: string
  isLoading?: boolean
  children: React.ReactNode
}

export const ManageFormLayout = ({
  backTo,
  backParams,
  backLabel,
  pageTitle,
  pageDescription,
  cardTitle,
  cardDescription,
  isLoading,
  children,
}: ManageFormLayoutProps) => {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-3xl px-4">
        <BackLink to={backTo} params={backParams}>
          {backLabel}
        </BackLink>

        <div className="space-y-4">
          <div>
            <h1 className="font-bold text-2xl md:text-3xl">{pageTitle}</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{pageDescription}</p>
          </div>

          <div className="rounded-lg bg-zinc-50 p-4 lg:p-8 dark:bg-slate-900">
            <div className="mb-6 space-y-1">
              <h2 className="font-semibold text-lg">{cardTitle}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{cardDescription}</p>
            </div>
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
