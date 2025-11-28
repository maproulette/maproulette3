import { AuthGuard } from '@/components/shared/AuthGuard'
import { BackLink } from '@/components/shared/BackLink'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
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
      <div className="container">
        <BackLink to={backTo} params={backParams}>
          {backLabel}
        </BackLink>

        <PageHeader title={pageTitle} description={pageDescription} className="mb-8" />

        <Card>
          <CardHeader>
            <CardTitle>{cardTitle}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              children
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
