import { useId, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { api } from '@/api'
import { useAuthContext } from '@/components/AuthContext'
import { useBrowsedChallengeContext } from '@/components/BrowsedChallengePage/contexts/BrowsedChallengeContext'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/utils/utils'
import { useChallengeModals } from './ChallengeModalsContext'

const MIN_CHARACTERS = 100
const MAX_CHARACTERS = 1000

const getParentInfo = (parent: unknown) => {
  if (typeof parent === 'object' && parent !== null) {
    const parentObj = parent as { id?: number; name?: string }
    return { id: parentObj.id ?? null, name: parentObj.name || 'Unknown Project' }
  }
  if (typeof parent === 'number' || typeof parent === 'string') {
    return { id: parent, name: 'Unknown Project' }
  }
  return { id: null, name: 'Unknown Project' }
}

const getCharacterCountColor = (count: number) => {
  if (count >= MAX_CHARACTERS || count < MIN_CHARACTERS) {
    return 'text-red-600 dark:text-red-400'
  }
  if (count >= MAX_CHARACTERS * 0.9) {
    return 'text-yellow-600 dark:text-yellow-400'
  }
  return 'text-zinc-500 dark:text-zinc-400'
}

const getGitHubErrorMessage = (status: number, message: string) => {
  if (message.includes('Bad credentials') || status === 401) {
    return 'GitHub authentication failed. Please check that your GitHub token is valid and has the necessary permissions.'
  }
  if (status === 403) {
    return 'GitHub API access forbidden. The token may not have the required permissions or the repository may be private.'
  }
  if (status === 404) {
    return 'GitHub repository not found. Please check that the repository exists and is accessible.'
  }
  return message
}

export const ReportModal = () => {
  const { user } = useAuthContext()
  const { challenge } = useBrowsedChallengeContext()
  const { isReportModalOpen, setReportOpen } = useChallengeModals()

  const emailId = useId()
  const textId = useId()
  const confirmId = useId()
  const [reportText, setReportText] = useState('')
  const [email, setEmail] = useState(user?.settings?.email || '')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showingPreview, setShowingPreview] = useState(false)
  const [errors, setErrors] = useState({ input: false, checkbox: false })

  const addCommentMutation = api.challenge.useAddChallengeComment()

  const characterCount = reportText.length

  const resetForm = () => {
    setReportText('')
    setEmail(user?.settings?.email || '')
    setIsConfirmed(false)
    setShowingPreview(false)
    setErrors({ input: false, checkbox: false })
  }

  const handleSubmit = async () => {
    if (characterCount < MIN_CHARACTERS) {
      setErrors((prev) => ({ ...prev, input: true }))
      return
    }

    if (!isConfirmed) {
      setErrors((prev) => ({ ...prev, checkbox: true }))
      return
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setErrors({ input: false, checkbox: false })

    try {
      const owner = import.meta.env.VITE_GITHUB_ISSUES_API_OWNER
      const repo = import.meta.env.VITE_GITHUB_ISSUES_API_REPO
      const token = import.meta.env.VITE_GITHUB_ISSUES_API_TOKEN
      const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
      const osmServer = import.meta.env.VITE_OSM_SERVER || 'https://www.openstreetmap.org'
      const userName = user?.osmProfile?.displayName || 'Unknown'
      const challengeUrl = `${appUrl}/browse/challenges/${challenge.id}`
      const userUrl = `${osmServer}/user/${encodeURIComponent(userName)}`

      let issueUrl: string | null = null

      if (owner && repo && token) {
        const issueBody = `Challenge: [#${challenge.id} - ${challenge.name}](${challengeUrl})\n\nReported by: [${userName}](${userUrl})\n\n${reportText}`

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            title: `Reported Challenge #${challenge.id} - ${challenge.name}`,
            body: issueBody,
            state: 'open' as const,
          }),
        })

        if (response.ok) {
          const issueData = await response.json()
          issueUrl = issueData.html_url

          const { id: parentId, name: parentName } = getParentInfo(challenge.parent)
          const commentText = `This challenge, challenge [#${challenge.id} - ${challenge.name}](${challengeUrl})${
            parentId
              ? ` in project [#${parentId} - ${parentName}](${appUrl}/browse/projects/${parentId})`
              : ''
          }, has been reported by [${userName}](${userUrl}). Please use [this GitHub issue](${issueUrl}) to discuss.\n\nReport Content:\n${reportText}`

          try {
            addCommentMutation.mutate({ challengeId: challenge.id, comment: commentText })
          } catch (commentError) {
            console.error('Failed to post comment:', commentError)
          }
        } else {
          const errorBody = await response.text()
          let errorMessage = `Failed to create GitHub issue: ${response.status} ${response.statusText}`
          try {
            const errorJson = JSON.parse(errorBody)
            if (errorJson.message) {
              errorMessage = getGitHubErrorMessage(response.status, errorJson.message)
            }
          } catch {
            // Use default error message
          }
          toast.error(errorMessage)
          throw new Error(errorMessage)
        }
      } else {
        try {
          addCommentMutation.mutate({
            challengeId: challenge.id,
            comment: `Challenge reported by ${userName}:\n\n${reportText}`,
          })
        } catch (commentError) {
          console.error('Failed to post comment:', commentError)
          throw commentError
        }
      }

      resetForm()
      setReportOpen(false)
      toast.success('Report submitted successfully')
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit report. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      setReportOpen(false)
    }
  }

  return (
    <Dialog open={isReportModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Report Challenge</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            You are about to report a Challenge. An issue will be created in a public GitHub
            repository and the Challenge creator will be notified by email. Any follow-up discussion
            should take place there. Reporting a Challenge does not disable it immediately. Please
            explain in detail what your issue is with this challenge, if possible linking to
            specific OSM changesets.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <label htmlFor={emailId} className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
            Email (optional)
          </label>
          <Input
            id={emailId}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="mt-1 mb-4"
          />

          <div className="mb-2 flex items-center justify-between text-xs leading-tight">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  setShowingPreview(false)
                  setErrors((prev) => ({ ...prev, input: false }))
                }}
                className={cn(
                  'border-zinc-300 border-r pr-2 font-medium uppercase transition-colors dark:border-zinc-700',
                  !showingPreview
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                )}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setShowingPreview(true)}
                className={cn(
                  'pl-2 font-medium uppercase transition-colors',
                  showingPreview
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                )}
              >
                Preview
              </button>
            </div>
            <span className={cn('font-medium', getCharacterCountColor(characterCount))}>
              {characterCount}/{MAX_CHARACTERS}
            </span>
          </div>

          {showingPreview ? (
            <div className="min-h-32 rounded border-2 border-zinc-300 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900">
              {reportText.trim() ? (
                <div className="prose prose-sm dark:prose-invert max-w-none break-words [&_a]:text-blue-600 [&_a]:hover:underline dark:[&_a]:text-blue-400">
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        />
                      ),
                    }}
                  >
                    {reportText}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-zinc-500 dark:text-zinc-400">Nothing to preview</p>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded border-2 border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
              <Textarea
                id={textId}
                rows={4}
                placeholder="Enter text here"
                value={reportText}
                onChange={(e) => {
                  const value = e.target.value
                  if (value.length <= MAX_CHARACTERS) {
                    setReportText(value)
                    setErrors((prev) => ({ ...prev, input: false }))
                  }
                }}
                disabled={isSubmitting}
                className="w-full resize-none appearance-none whitespace-pre-wrap break-all border-none bg-transparent p-3 font-mono text-sm shadow-inner outline-none placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              />
            </div>
          )}

          <div className="mt-4 flex items-baseline">
            <input
              type="checkbox"
              id={confirmId}
              checked={isConfirmed}
              onChange={(e) => {
                setIsConfirmed(e.target.checked)
                setErrors((prev) => ({ ...prev, checkbox: false }))
              }}
              disabled={isSubmitting}
              className="mr-2 h-4 w-4"
            />
            <label
              htmlFor={confirmId}
              className="cursor-pointer text-sm text-zinc-700 dark:text-zinc-300"
            >
              I have attempted to contact the Challenge creator
            </label>
          </div>

          {errors.input && (
            <div className="mt-2 text-red-600 text-sm dark:text-red-400">
              Report must be at least {MIN_CHARACTERS} characters
            </div>
          )}
          {errors.checkbox && (
            <div className="mt-2 text-red-600 text-sm dark:text-red-400">
              Please ensure that checkbox is checked before continue
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleSubmit} disabled={isSubmitting} className="px-8">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
