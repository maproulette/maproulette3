import { Link } from '@tanstack/react-router'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/Empty'
import { useIntl } from '@/i18n'
import { cn } from '@/lib/utils'

export const NotFound = ({ className, ...props }: React.ComponentProps<typeof Empty>) => {
  const { t } = useIntl()
  return (
    <Empty className={cn('min-h-svh', className)} {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>{t('common.pageNotFound', undefined, 'Page Not Found')}</EmptyTitle>
        <EmptyDescription>
          {t(
            'shared.notFound.description',
            undefined,
            'The page you are looking for does not exist.'
          )}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="lg" asChild>
          <Link to="/">{t('shared.notFound.backHome', undefined, 'Head back home')}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
