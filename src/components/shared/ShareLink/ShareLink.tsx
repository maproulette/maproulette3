import { Check, Copy, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useShareSupport } from '@/hooks/useShareSupport'
import { logger } from '@/lib/logger'

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
  const { copy, isCopied } = useCopyToClipboard()
  const shareSupported = useShareSupport()
  const url = buildAbsoluteUrl(path)

  const nativeShare = async () => {
    try {
      await navigator.share({ url, title, text: description })
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') {
        logger.warn('Native share failed', { error })
      }
    }
  }

  const trigger =
    variant === 'icon' ? (
      <Button variant="ghost" size="icon" aria-label="Share">
        <Share2 className="size-4" aria-hidden="true" />
      </Button>
    ) : (
      <Button variant="outline" size="sm" aria-label="Share">
        <Share2 className="size-4" aria-hidden="true" /> Share
      </Button>
    )

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align={align} className="w-80 space-y-3 p-4">
        <div className="font-medium text-sm">Share this link</div>
        <div className="flex gap-2">
          <Input readOnly value={url} className="font-mono text-xs" aria-label="Share URL" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              copy(url)
              toast.success('Copied to clipboard')
            }}
            aria-label="Copy URL"
          >
            {isCopied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        {shareSupported && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={nativeShare}
            className="w-full"
          >
            <Share2 className="size-4" aria-hidden="true" /> Share via…
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
