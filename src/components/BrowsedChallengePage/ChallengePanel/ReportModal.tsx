import { useId, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
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
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import type { Challenge } from '@/types/Challenge'

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  challenge: Challenge
  onSuccess?: () => void
}

const MIN_CHARACTERS = 100
const MAX_CHARACTERS = 1000

export const ReportModal = ({ open, onOpenChange, challenge, onSuccess }: ReportModalProps) => {
  const { user } = useAuthContext()
  const emailId = useId()
  const textId = useId()
  const confirmId = useId()
  const [reportText, setReportText] = useState('')
  const [email, setEmail] = useState(user?.settings?.email || '')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showingPreview, setShowingPreview] = useState(false)
  const [displayInputError, setDisplayInputError] = useState(false)
  const [displayCheckboxError, setDisplayCheckboxError] = useState(false)

  const characterCount = reportText.length

  const handleInputError = () => {
    setDisplayInputError(true)
  }

  const handleCheckboxError = () => {
    setDisplayCheckboxError(true)
  }

  const handleSubmit = async () => {
    if (characterCount < MIN_CHARACTERS) {
      handleInputError()
      return
    }

    if (!isConfirmed) {
      handleCheckboxError()
      return
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setDisplayInputError(false)
    setDisplayCheckboxError(false)

    try {
      const owner = import.meta.env.VITE_GITHUB_ISSUES_API_OWNER
      const repo = import.meta.env.VITE_GITHUB_ISSUES_API_REPO
      const token = import.meta.env.VITE_GITHUB_ISSUES_API_TOKEN
      const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
      const osmServer = import.meta.env.VITE_OSM_SERVER || 'https://www.openstreetmap.org'

      console.log('Report submission - GitHub config:', { owner, repo, hasToken: !!token })

      let issueUrl: string | null = null
      if (owner && repo && token) {
        const challengeUrl = `${appUrl}/browse/challenges/${challenge.id}`
        const userUrl = `${osmServer}/user/${encodeURIComponent(user?.osmProfile?.displayName || '')}`
        const issueBody = `Challenge: [#${challenge.id} - ${challenge.name}](${challengeUrl})\n\nReported by: [${user?.osmProfile?.displayName || 'Unknown'}](${userUrl})\n\n${reportText}`

        const issuePayload = {
          title: `Reported Challenge #${challenge.id} - ${challenge.name}`,
          body: issueBody,
          state: 'open' as const,
        }

        console.log('Creating GitHub issue:', { owner, repo, payload: issuePayload })
        console.log('Token length:', token?.length, 'Token starts with:', token?.substring(0, 4))

        // Try Bearer format first (modern standard, works for both classic and fine-grained tokens)
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json',
          },
          body: JSON.stringify(issuePayload),
        })

        console.log('GitHub API response:', {
          status: response.status,
          statusText: response.statusText,
        })

        if (response.ok) {
          const issueData = await response.json()
          issueUrl = issueData.html_url
          console.log('GitHub issue created:', issueUrl)

          const parentId =
            typeof challenge.parent === 'object' && challenge.parent !== null
              ? (challenge.parent as { id?: number; name?: string })?.id
              : typeof challenge.parent === 'number' || typeof challenge.parent === 'string'
                ? challenge.parent
                : null
          const parentName =
            typeof challenge.parent === 'object' && challenge.parent !== null
              ? (challenge.parent as { name?: string })?.name || 'Unknown Project'
              : 'Unknown Project'
          const commentText = `This challenge, challenge [#${challenge.id} - ${challenge.name}](${challengeUrl})${parentId ? ` in project [#${parentId} - ${parentName}](${appUrl}/browse/projects/${parentId})` : ''}, has been reported by [${user?.osmProfile?.displayName || 'Unknown'}](${userUrl}). Please use [this GitHub issue](${issueUrl}) to discuss.\n\nReport Content:\n${reportText}`

          try {
            const { api } = await import('@/api')
            await api.challenge.addChallengeComment(challenge.id, commentText)
            console.log('Comment posted to challenge')
          } catch (commentError) {
            console.error('Failed to post comment:', commentError)
          }
        } else {
          const errorBody = await response.text()
          console.error('GitHub API error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorBody,
          })
          let errorMessage = `Failed to create GitHub issue: ${response.status} ${response.statusText}`
          try {
            const errorJson = JSON.parse(errorBody)
            if (errorJson.message) {
              errorMessage = errorJson.message
              // Provide more helpful error messages
              if (errorJson.message.includes('Bad credentials') || response.status === 401) {
                errorMessage =
                  'GitHub authentication failed. Please check that your GitHub token is valid and has the necessary permissions (repo scope for private repos or public_repo for public repos).'
              } else if (response.status === 403) {
                errorMessage =
                  'GitHub API access forbidden. The token may not have the required permissions or the repository may be private.'
              } else if (response.status === 404) {
                errorMessage =
                  'GitHub repository not found. Please check that the repository exists and is accessible.'
              }
            }
          } catch {}
          toast.error(errorMessage)
          throw new Error(errorMessage)
        }
      } else {
        console.log('GitHub not configured, posting comment only')

        try {
          const { api } = await import('@/api')
          await api.challenge.addChallengeComment(
            challenge.id,
            `Challenge reported by ${user?.osmProfile?.displayName || 'Unknown'}:\n\n${reportText}`
          )
          console.log('Comment posted to challenge (no GitHub)')
        } catch (commentError) {
          console.error('Failed to post comment:', commentError)
          throw commentError
        }
      }

      setReportText('')
      setIsConfirmed(false)
      setShowingPreview(false)
      onOpenChange(false)
      toast.success('Report submitted successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting report:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit report. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setReportText('')
      setIsConfirmed(false)
      setShowingPreview(false)
      setDisplayInputError(false)
      setDisplayCheckboxError(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
          {/* Email Input */}
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

          {/* Write/Preview Toggle and Character Count */}
          <div className="mb-2 flex items-center justify-between text-xs leading-tight">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  setShowingPreview(false)
                  setDisplayInputError(false)
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
            <span
              className={cn('font-medium', {
                'text-red-600 dark:text-red-400':
                  characterCount >= MAX_CHARACTERS || characterCount < MIN_CHARACTERS,
                'text-yellow-600 dark:text-yellow-400':
                  characterCount < MAX_CHARACTERS &&
                  characterCount >= MAX_CHARACTERS * 0.9 &&
                  characterCount >= MIN_CHARACTERS,
                'text-zinc-500 dark:text-zinc-400':
                  characterCount < MAX_CHARACTERS * 0.9 && characterCount >= MIN_CHARACTERS,
              })}
            >
              {characterCount}/{MAX_CHARACTERS}
            </span>
          </div>

          {/* Text Input or Preview */}
          {showingPreview ? (
            <div className="min-h-32 rounded border-2 border-zinc-300 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900">
              {reportText.trim() ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&_a]:text-blue-600 [&_a]:hover:underline dark:[&_a]:text-blue-400">
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
            <Textarea
              id={textId}
              rows={4}
              placeholder="Enter text here"
              value={reportText}
              onChange={(e) => {
                const value = e.target.value
                if (value.length <= MAX_CHARACTERS) {
                  setReportText(value)
                  setDisplayInputError(false)
                }
              }}
              disabled={isSubmitting}
              className="appearance-none border-none bg-zinc-100 p-3 font-mono text-sm shadow-inner outline-none placeholder:text-zinc-500 dark:bg-zinc-800 dark:placeholder:text-zinc-400"
            />
          )}

          {/* Confirmation Checkbox */}
          <div className="mt-4 flex items-baseline">
            <input
              type="checkbox"
              id={confirmId}
              checked={isConfirmed}
              onChange={(e) => {
                setIsConfirmed(e.target.checked)
                setDisplayCheckboxError(false)
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

          {/* Error Messages */}
          {displayInputError && (
            <div className="mt-2 text-red-600 text-sm dark:text-red-400">
              Report must be at least {MIN_CHARACTERS} characters
            </div>
          )}
          {displayCheckboxError && (
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
