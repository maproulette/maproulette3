import { Code, Copy, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { ChallengeModals } from './ChallengeModals'

export const ChallengeActionButtons = () => {
  const { user, hasOverpass, canClone } = useBrowsedChallengeContext()
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [isOverpassModalOpen, setIsOverpassModalOpen] = useState(false)
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)

  const handleReportSuccess = () => {
    // Report modal is handled in ChallengeFooter
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {!!user && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsCommentsModalOpen(true)}
          >
            <MessageSquare className="size-3.5" />
            Comments
          </Button>
        )}
        {hasOverpass && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsOverpassModalOpen(true)}
          >
            <Code className="size-3.5" />
            Overpass
          </Button>
        )}
        {canClone && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsCloneModalOpen(true)}
          >
            <Copy className="size-3.5" />
            Clone
          </Button>
        )}
      </div>

      <ChallengeModals
        isReportModalOpen={isReportModalOpen}
        isCommentsModalOpen={isCommentsModalOpen}
        isOverpassModalOpen={isOverpassModalOpen}
        isCloneModalOpen={isCloneModalOpen}
        onReportModalChange={setIsReportModalOpen}
        onCommentsModalChange={setIsCommentsModalOpen}
        onOverpassModalChange={setIsOverpassModalOpen}
        onCloneModalChange={setIsCloneModalOpen}
        onReportSuccess={handleReportSuccess}
      />
    </>
  )
}
