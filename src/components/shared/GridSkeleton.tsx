import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

interface GridSkeletonProps {
  count?: number
}

export const GridSkeleton = ({ count = 6 }: GridSkeletonProps) => {
  const skeletonKeys = Array.from({ length: count }, (_, i) => `skeleton-${crypto.randomUUID()}-${i}`)

  return (
    <>
      {skeletonKeys.map((key) => (
        <Card key={key}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 h-12 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

