import { useId, useState } from 'react'
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
import { ScrollArea } from '@/components/ui/ScrollArea'
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

// Simple markdown-like rendering component that uses React elements instead of dangerouslySetInnerHTML
interface MarkdownPreviewProps {
  text: string
}

const MarkdownPreview = ({ text }: MarkdownPreviewProps) => {
  if (!text || text.trim() === '') {
    return <p className="text-zinc-500 dark:text-zinc-400">Nothing to preview</p>
  }

  // Split by lines to process headers
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let currentParagraph: string[] = []

  const processInlineMarkdown = (line: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0

    // Process links first (most specific)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let match: RegExpExecArray | null = linkRegex.exec(line)

    while (match !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        const beforeText = line.slice(lastIndex, match.index)
        parts.push(...processBoldItalic(beforeText))
      }

      // Process the link
      const linkText = match[1]
      const url = match[2]
      const urlLower = url.toLowerCase().trim()

      // Validate URL protocol
      if (
        urlLower.startsWith('javascript:') ||
        urlLower.startsWith('data:') ||
        urlLower.startsWith('vbscript:')
      ) {
        // Invalid protocol, render as plain text
        parts.push(match[0])
      } else {
        parts.push(
          <a
            key={`link-${match.index}`}
            href={url}
            className="text-blue-600 hover:underline dark:text-blue-400"
            rel="noopener noreferrer"
            target="_blank"
          >
            {linkText}
          </a>
        )
      }

      lastIndex = linkRegex.lastIndex
      match = linkRegex.exec(line)
    }

    // Add remaining text
    if (lastIndex < line.length) {
      const remainingText = line.slice(lastIndex)
      parts.push(...processBoldItalic(remainingText))
    }

    return parts.length > 0 ? parts : [line]
  }

  const processBoldItalic = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []

    // Process bold (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g
    let match: RegExpExecArray | null = boldRegex.exec(text)
    const boldMatches: Array<{ start: number; end: number; text: string }> = []

    while (match !== null) {
      boldMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
      })
      match = boldRegex.exec(text)
    }

    // Process italic (*text*)
    const italicRegex = /(?<!\*)\*([^*]+?)\*(?!\*)/g
    const italicMatches: Array<{ start: number; end: number; text: string }> = []
    match = italicRegex.exec(text)

    while (match !== null) {
      italicMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
      })
      match = italicRegex.exec(text)
    }

    // Combine and sort all matches
    const allMatches = [
      ...boldMatches.map((m) => ({ ...m, type: 'bold' as const })),
      ...italicMatches.map((m) => ({ ...m, type: 'italic' as const })),
    ].sort((a, b) => a.start - b.start)

    // Build parts
    let currentIndex = 0
    for (const match of allMatches) {
      if (match.start > currentIndex) {
        parts.push(text.slice(currentIndex, match.start))
      }
      if (match.type === 'bold') {
        parts.push(<strong key={`bold-${match.start}`}>{match.text}</strong>)
      } else {
        parts.push(<em key={`italic-${match.start}`}>{match.text}</em>)
      }
      currentIndex = match.end
    }

    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex))
    }

    return parts.length > 0 ? parts : [text]
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check for headers
    if (line.match(/^###\s+/)) {
      // Flush current paragraph
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${i}`} className="mb-2">
            {processInlineMarkdown(currentParagraph.join('\n'))}
          </p>
        )
        currentParagraph = []
      }
      const headerText = line.replace(/^###\s+/, '')
      elements.push(
        <h3 key={`h3-${i}`} className="mt-4 mb-2 font-bold text-lg">
          {processInlineMarkdown(headerText)}
        </h3>
      )
    } else if (line.match(/^##\s+/)) {
      // Flush current paragraph
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${i}`} className="mb-2">
            {processInlineMarkdown(currentParagraph.join('\n'))}
          </p>
        )
        currentParagraph = []
      }
      const headerText = line.replace(/^##\s+/, '')
      elements.push(
        <h2 key={`h2-${i}`} className="mt-4 mb-2 font-bold text-xl">
          {processInlineMarkdown(headerText)}
        </h2>
      )
    } else if (line.match(/^#\s+/)) {
      // Flush current paragraph
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${i}`} className="mb-2">
            {processInlineMarkdown(currentParagraph.join('\n'))}
          </p>
        )
        currentParagraph = []
      }
      const headerText = line.replace(/^#\s+/, '')
      elements.push(
        <h1 key={`h1-${i}`} className="mt-4 mb-2 font-bold text-2xl">
          {processInlineMarkdown(headerText)}
        </h1>
      )
    } else if (line.trim() === '') {
      // Empty line - flush paragraph
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${i}`} className="mb-2">
            {processInlineMarkdown(currentParagraph.join('\n'))}
          </p>
        )
        currentParagraph = []
      }
    } else {
      currentParagraph.push(line)
    }
  }

  // Flush remaining paragraph
  if (currentParagraph.length > 0) {
    elements.push(
      <p key="p-final" className="mb-2">
        {processInlineMarkdown(currentParagraph.join('\n'))}
      </p>
    )
  }

  return <div>{elements}</div>
}

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
  const [errors, setErrors] = useState<{
    text?: string
    email?: string
    confirmation?: string
  }>({})

  const characterCount = reportText.length
  const isValidLength = characterCount >= MIN_CHARACTERS && characterCount <= MAX_CHARACTERS

  const handleSubmit = async () => {
    const newErrors: typeof errors = {}

    if (!isValidLength) {
      newErrors.text = `Report must be between ${MIN_CHARACTERS} and ${MAX_CHARACTERS} characters`
    }

    if (!isConfirmed) {
      newErrors.confirmation = 'Please ensure that checkbox is checked before continue'
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

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

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
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
      setErrors({
        text: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setReportText('')
      setIsConfirmed(false)
      setShowingPreview(false)
      setErrors({})
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

        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <label
              htmlFor={emailId}
              className="font-medium text-sm text-zinc-900 dark:text-zinc-50"
            >
              Email (optional)
            </label>
            <Input
              id={emailId}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-red-600 text-sm dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Report Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowingPreview(false)}
                  className={cn(
                    'px-2 py-1 font-medium text-xs uppercase transition-colors',
                    !showingPreview
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                  )}
                >
                  Write
                </button>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <button
                  type="button"
                  onClick={() => setShowingPreview(true)}
                  className={cn(
                    'px-2 py-1 font-medium text-xs uppercase transition-colors',
                    showingPreview
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                  )}
                >
                  Preview
                </button>
              </div>
              <span
                className={cn('font-medium text-xs', {
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
            {showingPreview ? (
              <ScrollArea className="h-40 w-full rounded-md border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-zinc-900 dark:text-zinc-50">
                  <MarkdownPreview text={reportText} />
                </div>
              </ScrollArea>
            ) : (
              <Textarea
                id={textId}
                rows={6}
                placeholder="Please describe the issue with this challenge (minimum 100 characters)"
                value={reportText}
                onChange={(e) => {
                  const value = e.target.value
                  if (value.length <= MAX_CHARACTERS) {
                    setReportText(value)
                    if (errors.text) {
                      setErrors({ ...errors, text: undefined })
                    }
                  }
                }}
                disabled={isSubmitting}
                className={cn('font-mono text-sm', errors.text ? 'border-red-500' : '')}
              />
            )}
            {errors.text && <p className="text-red-600 text-sm dark:text-red-400">{errors.text}</p>}
            {characterCount < MIN_CHARACTERS && !showingPreview && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                At least {MIN_CHARACTERS} characters required ({MIN_CHARACTERS - characterCount}{' '}
                more needed)
              </p>
            )}
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id={confirmId}
              checked={isConfirmed}
              onChange={(e) => {
                setIsConfirmed(e.target.checked)
                if (errors.confirmation) {
                  setErrors({ ...errors, confirmation: undefined })
                }
              }}
              disabled={isSubmitting}
              className="mt-1 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700"
            />
            <label
              htmlFor={confirmId}
              className="cursor-pointer text-sm text-zinc-700 dark:text-zinc-300"
            >
              I have attempted to contact the Challenge creator
            </label>
          </div>
          {errors.confirmation && (
            <p className="text-red-600 text-sm dark:text-red-400">{errors.confirmation}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isValidLength || !isConfirmed}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
