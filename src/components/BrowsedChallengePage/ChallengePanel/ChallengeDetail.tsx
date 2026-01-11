import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ChevronDown,
  Flag,
  FolderKanban,
  Heart,
  Map as MapIcon,
  Play,
  Settings,
  Star,
  User,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { api } from '@/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { useAuthContext } from '@/contexts/AuthContext'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { getDifficultyLabel } from '@/utils/difficultyLevelData'
import { useMapToggle } from '../index'
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
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch favorite and like status
  const { data: favoriteData } = useQuery(api.challenge.isChallengeFavorited(challenge.id || 0))
  const { data: likeData } = useQuery(api.challenge.isChallengeLiked(challenge.id || 0))

  const isFavorited = favoriteData?.isFavorited ?? false
  const isLiked = likeData?.isLiked ?? false

  // Check if flagging is active (GitHub configured)
  const isFlaggingActive =
    !!import.meta.env.VITE_GITHUB_ISSUES_API_OWNER &&
    !!import.meta.env.VITE_GITHUB_ISSUES_API_REPO &&
    !!import.meta.env.VITE_GITHUB_ISSUES_API_TOKEN

  // Function to check for existing GitHub issue
  const checkForIssue = async () => {
    const owner = import.meta.env.VITE_GITHUB_ISSUES_API_OWNER
    const repo = import.meta.env.VITE_GITHUB_ISSUES_API_REPO

    if (!owner || !repo || !challenge.id || !isFlaggingActive) {
      setExistingIssue(null)
      return
    }

    setIsCheckingIssue(true)
    try {
      // Search for issues with the challenge ID in the title (matching maproulette3 format exactly)
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

  // Check for existing GitHub issue on mount and when challenge changes (only if GitHub is configured)
  useEffect(() => {
    if (challenge.id && isFlaggingActive) {
      checkForIssue()
    } else {
      setExistingIssue(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.id, isFlaggingActive])

  // Check if there's more content to scroll
  useEffect(() => {
    const checkScrollPosition = () => {
      if (!scrollAreaRef.current) return

      // Find the viewport element inside the ScrollArea
      const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
      if (!viewport) return

      const { scrollTop, scrollHeight, clientHeight } = viewport
      // Check if there's more content below (with a small threshold to account for rounding)
      const hasMore = scrollHeight - scrollTop - clientHeight > 10
      setHasMoreToScroll(hasMore)
    }

    // Check initially and after a short delay to ensure content is rendered
    checkScrollPosition()
    const timeoutId = setTimeout(checkScrollPosition, 100)

    // Set up scroll listener
    const viewport = scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
    if (viewport) {
      viewport.addEventListener('scroll', checkScrollPosition)
      // Also check on resize
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
        // No tasks available
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
      // Invalidate and refetch the favorite status
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
      // Invalidate and refetch the like status
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
      // Open existing issue in new tab
      window.open(existingIssue.html_url, '_blank')
    } else {
      // Open report modal
      setIsReportModalOpen(true)
    }
  }

  const handleReportSuccess = () => {
    toast.success('Report submitted successfully')
    // Recheck for issues after a short delay to allow GitHub API to index the new issue
    setTimeout(() => {
      checkForIssue()
    }, 3000)
  }

  // Extract project ID and name
  const getProjectInfo = () => {
    if (!challenge.parent) return null
    if (typeof challenge.parent === 'object' && challenge.parent !== null) {
      return {
        id: (challenge.parent as { id?: number })?.id,
        name: (challenge.parent as { name?: string; displayName?: string })?.displayName ||
          (challenge.parent as { name?: string })?.name ||
          'Unknown Project',
      }
    }
    if (typeof challenge.parent === 'number' || typeof challenge.parent === 'string') {
      return {
        id: Number(challenge.parent),
        name: 'Project',
      }
    }
    return null
  }

  const projectInfo = getProjectInfo()
  const projectId = projectInfo?.id
  const projectName = projectInfo?.name || 'Independent Challenge'

  // Extract owner info - could be ID or username
  const ownerName = typeof challenge.owner === 'string' ? challenge.owner : String(challenge.owner || 'Unknown')

  // Check if cooperative (cooperativeType > 0)
  const isCooperative = (challenge.cooperativeType || 0) > 0

  // Get difficulty badge color (pink/rose for high difficulty)
  const getDifficultyBadgeColor = () => {
    if (challenge.difficulty === 3) return 'bg-pink-500 text-white dark:bg-pink-600'
    if (challenge.difficulty === 1) return 'bg-green-500 text-white dark:bg-green-600'
    return 'bg-blue-500 text-white dark:bg-blue-600'
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="flex flex-col p-6">
          {/* Challenge Name Header */}
          <div className="pb-4">
            <h1 className="line-clamp-2 font-bold text-2xl leading-tight text-zinc-900 dark:text-zinc-50">
              {challenge.name}
            </h1>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getDifficultyBadgeColor()}>
              Difficulty: {getDifficultyLabel(challenge.difficulty)}
            </Badge>
            {isCooperative && (
              <Badge className="bg-green-400 text-white dark:bg-green-500">Cooperative</Badge>
            )}
            {challenge.featured && (
              <Badge className="bg-yellow-500 text-white dark:bg-yellow-600">Featured</Badge>
            )}
          </div>

          {/* Project Section */}
          {projectId ? (
            <Link
              to="/project/$projectId"
              params={{ projectId: String(projectId) }}
              className="group -ml-6 flex cursor-pointer items-center gap-3 rounded-lg py-2 pr-2 pl-6 transition-all hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 transition-all group-hover:bg-blue-500/20 dark:bg-blue-400/10 dark:group-hover:bg-blue-400/20">
                <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium text-sm text-zinc-900 transition-colors group-hover:text-blue-600 dark:text-zinc-50 group-hover:dark:text-blue-400">
                {projectName}
              </span>
            </Link>
          ) : (
            <div className="-ml-6 flex items-center gap-3 pl-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-400/10">
                <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                {projectName}
              </span>
            </div>
          )}

          {/* Creator Section */}
          {ownerName && ownerName !== 'Unknown' ? (
            <a
              href={`https://www.openstreetmap.org/user/${encodeURIComponent(ownerName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group -ml-6 flex cursor-pointer items-center gap-3 rounded-lg py-2 pr-2 pl-6 transition-all hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 transition-all group-hover:bg-purple-500/20 dark:bg-purple-400/10 dark:group-hover:bg-purple-400/20">
                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium text-sm text-zinc-900 transition-colors group-hover:text-purple-600 dark:text-zinc-50 group-hover:dark:text-purple-400">
                {ownerName}
              </span>
            </a>
          ) : (
            <div className="-ml-6 flex items-center gap-3 pl-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 dark:bg-purple-400/10">
                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                {ownerName}
              </span>
            </div>
          )}

          {/* Description Section */}
          <div className="mb-6 flex flex-col gap-3">
            <ScrollArea className="max-h-96">
              <div className="markdown-content text-sm text-zinc-700 leading-relaxed dark:text-zinc-300 [&_h1]:mb-3 [&_h1]:mt-4 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-zinc-900 [&_h1]:dark:text-zinc-50 [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h2]:dark:text-zinc-50 [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_h3]:dark:text-zinc-50 [&_h4]:mb-1 [&_h4]:mt-2 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-zinc-900 [&_h4]:dark:text-zinc-50 [&_p]:my-2 [&_ul]:my-2 [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:ml-6 [&_ol]:list-decimal [&_li]:my-1 [&_strong]:font-semibold [&_strong]:text-zinc-900 [&_strong]:dark:text-zinc-50 [&_em]:italic [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:dark:bg-zinc-800 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-zinc-100 [&_pre]:p-3 [&_pre]:dark:bg-zinc-800 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:dark:border-zinc-600 [&_hr]:my-4 [&_hr]:border-zinc-300 [&_hr]:dark:border-zinc-600">
                {challenge.description ? (
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
                ) : (
                  <p>No description available.</p>
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
        {/* Scroll More Indicator */}
        {hasMoreToScroll && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 flex items-end justify-center bg-gradient-to-t from-zinc-50 via-zinc-50/80 to-transparent pb-2 pt-8 dark:from-zinc-950 dark:via-zinc-950/80">
            <div className="flex flex-col items-center gap-1">
              <ChevronDown className="size-4 animate-bounce text-zinc-500 dark:text-zinc-400" />
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Scroll for more</span>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Section */}
      <div className="border-zinc-200/50 border-t p-6 backdrop-blur-sm dark:border-zinc-800/50">
        {/* Progress Section */}
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

        {/* Action Buttons Row */}
        <div className="mb-4 flex flex-wrap gap-2">
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
              <Flag className={`size-4 transition-all ${existingIssue ? 'fill-current' : ''}`} />
              {existingIssue ? 'Reported' : 'Report'}
            </Button>
          )}
        </div>

        {/* Reported Description */}
        {existingIssue && (
          <p className="mb-4 text-xs text-red-600 dark:text-red-400">
            This challenge has been reported. Click the Reported button to view the issue.
          </p>
        )}

        {/* Primary Action Buttons */}
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
          <Button variant="outline" size="lg" className="w-full gap-2 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800" asChild>
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

      {/* Report Modal */}
      {user && (
        <ReportModal
          open={isReportModalOpen}
          onOpenChange={setIsReportModalOpen}
          challenge={challenge}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  )
}
