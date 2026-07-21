import { Loader2Icon } from 'lucide-react'

import { useIntl } from '@/i18n'
import { cn } from '@/lib/utils'

export const Spinner = ({ className, ...props }: React.ComponentProps<'svg'>) => {
  const { t } = useIntl()

  return (
    <Loader2Icon
      role="status"
      aria-label={t('ui.spinner.loading', undefined, 'Loading')}
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}
