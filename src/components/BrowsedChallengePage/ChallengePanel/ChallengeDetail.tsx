import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ChevronDown,
  Code,
  Copy,
  Flag,
  Heart,
  Map as MapIcon,
  MessageSquare,
  Play,
  Settings,
  Star,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Progress } from '@/components/ui/Progress'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { useAuthContext } from '@/contexts/AuthContext'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { useMapToggle } from '../index'
import { ChallengeComments } from './ChallengeComments'
import { CloneChallengeModal } from './CloneChallengeModal'
import { ReportModal } from './ReportModal'

export const ChallengeDetail = () => {
  const { challenge } = useBrowsedChallengeContext()
  const { user } = useAuthContext()
  const { showMap, setShowMap } = useMapToggle()
  const [isLoadingTask, setIsLoadingTask] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [existingIssue, setExistingIssue] = useState<{ html_url: string } | null>(null)
  const [isCheckingIssue, setIsCheckingIssue] = useState(false)
  const [hasMoreToScroll, setHasMoreToScroll] = useState(false)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [isOverpassModalOpen, setIsOverpassModalOpen] = useState(false)
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: favoriteData } = useQuery({
    ...api.challenge.isChallengeFavorited(challenge.id!),
    enabled: !!challenge.id,
  })
  const { data: likeData } = useQuery({
    ...api.challenge.isChallengeLiked(challenge.id!),
    enabled: !!challenge.id,
  })

  const { data: managedProjects } = useQuery({
    ...api.project.getManagedProjects({
      limit: 1,
      page: 0,
      onlyEnabled: false,
      onlyOwned: false,
      searchString: '',
    }),
    enabled: !!user,
  })

  const isFavorited = favoriteData?.isFavorited
  const isLiked = likeData?.isLiked
  const canClone = !!user && managedProjects && managedProjects.length > 0

  const isFlaggingActive =
    !!import.meta.env.VITE_GITHUB_ISSUES_API_OWNER &&
    !!import.meta.env.VITE_GITHUB_ISSUES_API_REPO &&
    !!import.meta.env.VITE_GITHUB_ISSUES_API_TOKEN

  const checkForIssue = async () => {
    const owner = import.meta.env.VITE_GITHUB_ISSUES_API_OWNER
    const repo = import.meta.env.VITE_GITHUB_ISSUES_API_REPO

    if (!owner || !repo || !challenge.id || !isFlaggingActive) {
      setExistingIssue(null)
      return
    }

    setIsCheckingIssue(true)
    try {
      const query = `q='Reported+Challenge+${encodeURIComponent('#') + challenge.id}'+in:title+state:open+repo:${owner}/${repo}`
      const url = `https://api.github.com/search/issues?${query}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.github.text-match+json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data?.total_count > 0 && data.items && data.items.length > 0) {
          setExistingIssue(data.items[0])
        } else {
          setExistingIssue(null)
        }
      } else {
        console.error('Failed to check for issues:', response.status, response.statusText)
        setExistingIssue(null)
      }
    } catch (error) {
      console.error('Error checking for existing issue:', error)
      setExistingIssue(null)
    } finally {
      setIsCheckingIssue(false)
    }
  }

  useEffect(() => {
    if (challenge.id && isFlaggingActive) {
      checkForIssue()
    } else {
      setExistingIssue(null)
    }
  }, [challenge.id, isFlaggingActive])

  useEffect(() => {
    const checkScrollPosition = () => {
      if (!scrollAreaRef.current) return

      const viewport = scrollAreaRef.current.querySelector(
        '[data-slot="scroll-area-viewport"]'
      ) as HTMLElement
      if (!viewport) return

      const { scrollTop, scrollHeight, clientHeight } = viewport

      const hasMore = scrollHeight - scrollTop - clientHeight > 10
      setHasMoreToScroll(hasMore)
    }

    checkScrollPosition()
    const timeoutId = setTimeout(checkScrollPosition, 100)

    const viewport = scrollAreaRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement
    if (viewport) {
      viewport.addEventListener('scroll', checkScrollPosition)

      window.addEventListener('resize', checkScrollPosition)
    }

    return () => {
      clearTimeout(timeoutId)
      if (viewport) {
        viewport.removeEventListener('scroll', checkScrollPosition)
        window.removeEventListener('resize', checkScrollPosition)
      }
    }
  }, [challenge.description, challenge.blurb])

  const handleStartTask = async () => {
    if (!challenge.id) return

    try {
      setIsLoadingTask(true)
      const tasks = await queryClient.fetchQuery(api.challenge.getRandomTask(challenge.id))

      if (tasks && tasks.length > 0) {
        const taskId = tasks[0].id
        await navigate({ to: '/tasks/$taskId', params: { taskId: String(taskId) } })
      } else {
        toast.error('No tasks available for this challenge')
      }
    } catch (error) {
      console.error('Error starting task:', error)
      toast.error('Failed to load task')
    } finally {
      setIsLoadingTask(false)
    }
  }

  const handleFavorite = async () => {
    if (!challenge.id) return

    try {
      if (isFavorited) {
        await api.challenge.unfavoriteChallenge(challenge.id)
        toast.success('Removed from favorites')
      } else {
        await api.challenge.favoriteChallenge(challenge.id)
        toast.success('Added to favorites')
      }

      await queryClient.invalidateQueries({
        queryKey: ['challenge', challenge.id, 'isFavorited'],
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite status')
    }
  }

  const handleLike = async () => {
    if (!challenge.id) return

    try {
      if (isLiked) {
        await api.challenge.unlikeChallenge(challenge.id)
        toast.success('Like removed')
      } else {
        await api.challenge.likeChallenge(challenge.id)
        toast.success('Challenge liked!')
      }

      await queryClient.invalidateQueries({
        queryKey: ['challenge', challenge.id, 'isLiked'],
      })
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like status')
    }
  }

  const handleReport = () => {
    if (existingIssue) {
      window.open(existingIssue.html_url, '_blank')
    } else {
      setIsReportModalOpen(true)
    }
  }

  const handleReportSuccess = () => {
    toast.success('Report submitted successfully')

    setTimeout(() => {
      checkForIssue()
    }, 3000)
  }

  const getProjectInfo = () => {
    if (!challenge.parent) return null
    if (typeof challenge.parent === 'object' && challenge.parent !== null) {
      return {
        id: (challenge.parent as { id?: number })?.id,
        name:
          (challenge.parent as { name?: string; displayName?: string })?.displayName ||
          (challenge.parent as { name?: string })?.name,
      }
    }
    if (typeof challenge.parent === 'number' || typeof challenge.parent === 'string') {
      return {
        id: Number(challenge.parent),
        name: null,
      }
    }
    return null
  }

  const projectInfo = getProjectInfo()
  const projectId = projectInfo?.id
  const projectNameFromParent = projectInfo?.name

 
  const { data: projectData } = useQuery({
    ...api.project.getProject(projectId),
    enabled: !!projectId && !projectNameFromParent,
  })

  const projectName =
    projectNameFromParent ||
    projectData?.displayName ||
    projectData?.name

  const ownerName =
    typeof challenge.owner === 'string'
      ? challenge.owner
      : typeof challenge.owner === 'object' && challenge.owner !== null
        ? (challenge.owner as { name?: string; osmProfile?: { displayName?: string } })?.name ||
          (challenge.owner as { osmProfile?: { displayName?: string } })?.osmProfile?.displayName
        : typeof challenge.owner === 'number'
          ? String(challenge.owner)
          : undefined

  const formatCreatedDate = (dateValue?: number | string) => {
    if (!dateValue) return null
    try {
     
      const date = typeof dateValue === 'string' 
        ? new Date(dateValue)
        : new Date(dateValue * 1000)
      
     
      if (isNaN(date.getTime())) return null
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return null
    }
  }

  const formattedDate = formatCreatedDate(challenge.created)
  const hasOverpass = !!(challenge as { overpassQL?: string }).overpassQL

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="flex flex-col p-6">
            <div className="mb-6 space-y-1.5">
              <h1 className="line-clamp-2 font-bold text-2xl leading-tight text-zinc-900 dark:text-zinc-50">
                {challenge.name}
              </h1>
              {(projectName || ownerName || formattedDate) ? (
                <div className="flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
                  {projectName && (
                    <span className="font-medium">{projectName}</span>
                  )}
                  {projectName &&
                    (ownerName || formattedDate) && (
                      <span className="text-zinc-500 dark:text-zinc-600">•</span>
                    )}
                  {ownerName && (
                    <span>
                      by{' '}
                      <a
                        href={`https://www.openstreetmap.org/user/${encodeURIComponent(ownerName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        {ownerName}
                      </a>
                    </span>
                  )}
                  {ownerName &&
                    formattedDate && (
                      <span className="text-zinc-500 dark:text-zinc-600">•</span>
                    )}
                  {formattedDate && <span>{formattedDate}</span>}
                </div>
              ) : null}
            </div>

      
            <div className="mb-6 grid grid-cols-3 gap-2">
              <Button
                variant={isFavorited ? 'default' : 'outline'}
                size="sm"
                className="gap-2 transition-all hover:scale-105"
                onClick={handleFavorite}
              >
                <Star
                  className={`size-4 transition-all ${
                    isFavorited ? 'fill-yellow-500 text-yellow-500' : ''
                  }`}
                />
                {isFavorited ? 'Favorited' : 'Favorite'}
              </Button>
              <Button
                variant={isLiked ? 'default' : 'outline'}
                size="sm"
                className="gap-2 transition-all hover:scale-105"
                onClick={handleLike}
              >
                <Heart
                  className={`size-4 transition-all ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              {user && (
                <Button
                  variant={existingIssue ? 'default' : 'outline'}
                  size="sm"
                  className={`gap-2 transition-all hover:scale-105 ${
                    existingIssue
                      ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:text-white dark:hover:bg-red-800'
                      : ''
                  }`}
                  onClick={handleReport}
                  disabled={isCheckingIssue}
                  title={existingIssue ? 'View GitHub issue' : 'Report challenge'}
                >
                  <Flag
                    className={`size-4 transition-all ${existingIssue ? 'fill-current' : ''}`}
                  />
                  {existingIssue ? 'Reported' : 'Report'}
                </Button>
              )}
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 transition-all hover:scale-105"
                  onClick={() => setIsCommentsModalOpen(true)}
                >
                  <MessageSquare className="size-4" />
                  <span>Comments</span>
                </Button>
              )}
              {hasOverpass && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 transition-all hover:scale-105"
                  onClick={() => setIsOverpassModalOpen(true)}
                >
                  <Code className="size-4" />
                  <span>Overpass</span>
                </Button>
              )}
              {canClone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 transition-all hover:scale-105"
                  onClick={() => setIsCloneModalOpen(true)}
                >
                  <Copy className="size-4" />
                  <span>Clone</span>
                </Button>
              )}
            </div>

            {existingIssue && (
              <p className="mb-4 text-red-600 text-xs dark:text-red-400">
                This challenge has been reported. Click the Reported button to view the issue.
              </p>
            )}

            <div className="mb-6 flex flex-col gap-3">
              <ScrollArea className="max-h-96">
                <div className="markdown-content text-sm text-zinc-700 leading-relaxed dark:text-zinc-300 [&_blockquote]:my-2 [&_blockquote]:border-zinc-300 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:dark:border-zinc-600 [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:dark:bg-zinc-800 [&_em]:italic [&_h1]:mt-4 [&_h1]:mb-3 [&_h1]:font-semibold [&_h1]:text-xl [&_h1]:text-zinc-900 [&_h1]:dark:text-zinc-50 [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:text-zinc-900 [&_h2]:dark:text-zinc-50 [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-base [&_h3]:text-zinc-900 [&_h3]:dark:text-zinc-50 [&_h4]:mt-2 [&_h4]:mb-1 [&_h4]:font-semibold [&_h4]:text-sm [&_h4]:text-zinc-900 [&_h4]:dark:text-zinc-50 [&_hr]:my-4 [&_hr]:border-zinc-300 [&_hr]:dark:border-zinc-600 [&_li]:my-1 [&_ol]:my-2 [&_ol]:ml-6 [&_ol]:list-decimal [&_p]:my-2 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-zinc-100 [&_pre]:p-3 [&_pre]:dark:bg-zinc-800 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_strong]:text-zinc-900 [&_strong]:dark:text-zinc-50 [&_ul]:my-2 [&_ul]:ml-6 [&_ul]:list-disc">
                  {challenge.description && (
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
                      {challenge.description}
                    </ReactMarkdown>
                  )}
                  {challenge.blurb && (
                    <div className="mt-3 text-zinc-600 italic dark:text-zinc-400">
                      {challenge.blurb}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </ScrollArea>

        {hasMoreToScroll && (
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 flex items-end justify-center bg-gradient-to-t from-zinc-50 via-zinc-50/80 to-transparent pt-8 pb-2 dark:from-zinc-950 dark:via-zinc-950/80">
            <div className="flex flex-col items-center gap-1">
              <ChevronDown className="size-4 animate-bounce text-zinc-500 dark:text-zinc-400" />
              <span className="font-medium text-xs text-zinc-500 dark:text-zinc-400">
                Scroll for more
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-zinc-200/50 border-t p-6 backdrop-blur-sm dark:border-zinc-800/50">
        {challenge.completionPercentage !== undefined && (
          <div className="mb-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">Progress</span>
              </div>
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
                {challenge.completionPercentage}%
              </span>
            </div>
            <Progress
              value={challenge.completionPercentage}
              className="h-2 bg-zinc-200/30 dark:bg-zinc-700/30"
            />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full gap-2 bg-[#00a592] text-white shadow-md transition-all hover:bg-[#008f7d] hover:shadow-lg dark:bg-[#00a592] dark:hover:bg-[#008f7d]"
            onClick={handleStartTask}
            disabled={isLoadingTask}
          >
            <Play className="size-5" />
            {isLoadingTask ? 'Loading...' : 'Start Task'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
            asChild
          >
            <Link
              to="/manage/challenge/$challengeId"
              params={{ challengeId: String(challenge.id) }}
            >
              <Settings className="size-5" />
              Manage Challenge
            </Link>
          </Button>
        </div>

        <div className="mt-4 md:hidden">
          <Button
            onClick={() => setShowMap(!showMap)}
            variant="outline"
            size="lg"
            className="w-full gap-2 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <MapIcon className="size-5" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
        </div>
      </div>

      {user && (
        <ReportModal
          open={isReportModalOpen}
          onOpenChange={setIsReportModalOpen}
          challenge={challenge}
          onSuccess={handleReportSuccess}
        />
      )}

      {user && (
        <Dialog open={isCommentsModalOpen} onOpenChange={setIsCommentsModalOpen}>
          <DialogContent className="flex h-[80vh] max-w-2xl flex-col">
            <DialogHeader>
              <DialogTitle>Challenge Comments</DialogTitle>
            </DialogHeader>
            <div className="flex min-h-0 flex-1 flex-col">
              <ChallengeComments
                challengeId={challenge.id}
                ownerId={
                  typeof challenge.owner === 'object' && challenge.owner !== null
                    ? (challenge.owner as { id?: number; osmProfile?: { id?: number } })?.id ||
                      (challenge.owner as { osmProfile?: { id?: number } })?.osmProfile?.id
                    : typeof challenge.owner === 'number'
                      ? challenge.owner
                      : undefined
                }
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {hasOverpass && (
        <Dialog open={isOverpassModalOpen} onOpenChange={setIsOverpassModalOpen}>
          <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col">
            <DialogHeader>
              <DialogTitle>Overpass Query</DialogTitle>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <textarea
                    readOnly
                    value={(challenge as { overpassQL?: string }).overpassQL}
                    className="h-full w-full resize-none rounded-lg border-0 bg-transparent p-4 font-mono text-sm text-zinc-900 focus:outline-none dark:text-zinc-50"
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {canClone && (
        <CloneChallengeModal
          open={isCloneModalOpen}
          onOpenChange={setIsCloneModalOpen}
          challengeId={challenge.id}
          challengeName={challenge.name}
          currentProjectId={projectId}
        />
      )}
    </div>
  )
}
