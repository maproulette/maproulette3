import { Check, Copy, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { logger } from '@/lib/logger'

interface Props {
  userId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Phase = 'confirm' | 'regenerating' | 'reveal'

export const RegenerateApiKeyDialog = ({ userId, open, onOpenChange }: Props) => {
  const [phase, setPhase] = useState<Phase>('confirm')
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const regenerate = api.user.useRegenerateApiKey()
  const { copy, isCopied } = useCopyToClipboard()

  useEffect(() => {
    if (!open) {
      setPhase('confirm')
      setRevealedKey(null)
    }
  }, [open])

  const handleRegenerate = async () => {
    setPhase('regenerating')
    try {
      const updated = await regenerate.mutateAsync(userId)
      if (!updated.apiKey) {
        throw new Error('Server did not return a new API key')
      }
      setRevealedKey(updated.apiKey)
      setPhase('reveal')
    } catch (error) {
      logger.error('Failed to regenerate API key', { error })
      toast.error('Failed to regenerate API key')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {phase === 'reveal' && revealedKey ? (
          <>
            <DialogHeader>
              <DialogTitle>Your new API key</DialogTitle>
              <DialogDescription>
                Copy it now — once you close this dialog, you won't be able to see it again. If you
                lose it, you'll need to regenerate another.
              </DialogDescription>
            </DialogHeader>
            <div className="break-all rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-900">
              {revealedKey}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  copy(revealedKey)
                  toast.success('Copied to clipboard')
                }}
              >
                {isCopied ? (
                  <>
                    <Check aria-hidden="true" /> Copied
                  </>
                ) : (
                  <>
                    <Copy aria-hidden="true" /> Copy key
                  </>
                )}
              </Button>
              <Button type="button" onClick={() => onOpenChange(false)}>
                I have saved this key
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TriangleAlert className="size-5 text-amber-500" aria-hidden="true" />
                Regenerate API key?
              </DialogTitle>
              <DialogDescription>
                Your existing API key will stop working immediately. Any scripts or integrations
                using the old key will need to be updated.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={phase === 'regenerating'}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleRegenerate} disabled={phase === 'regenerating'}>
                {phase === 'regenerating' ? 'Regenerating…' : 'Regenerate'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
