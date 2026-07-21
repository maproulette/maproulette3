import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { useIntl } from '@/i18n'
import { SharePopoverContent } from './SharePopoverContent'

interface Props {
  path: string
  title?: string
  description?: string
  variant?: 'icon' | 'button'
  align?: 'start' | 'center' | 'end'
}

const buildAbsoluteUrl = (path: string): string => {
  if (typeof window === 'undefined') return path
  const base = window.location.origin
  return path.startsWith('http') ? path : `${base}${path}`
}

export const ShareLink = ({ path, title, description, variant = 'icon', align = 'end' }: Props) => {
  const { t } = useIntl()
  const url = buildAbsoluteUrl(path)
  const shareLabel = t('shareLink.share', undefined, 'Share')

  const trigger =
    variant === 'icon' ? (
      <Button variant="ghost" size="icon" aria-label={shareLabel}>
        <Share2 className="size-4" aria-hidden="true" />
      </Button>
    ) : (
      <Button variant="outline" size="sm" aria-label={shareLabel}>
        <Share2 className="size-4" aria-hidden="true" /> {shareLabel}
      </Button>
    )

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align={align} className="w-80">
        <SharePopoverContent url={url} title={title} description={description} />
      </PopoverContent>
    </Popover>
  )
}
