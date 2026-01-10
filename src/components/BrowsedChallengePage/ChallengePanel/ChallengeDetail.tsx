import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flag,
  FolderKanban,
  Heart,
  Map as MapIcon,
  Play,
  Settings,
  Star,
  Target,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'
import { useAuthContext } from '@/contexts/AuthContext'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'
import { getDifficultyColor, getDifficultyLabel } from '@/utils/difficultyLevelData'
import { useMapToggle } from '../index'
import { ReportModal } from './ReportModal'

export const ChallengeDetail = () => {
  const { challenge } = useBrowsedChallengeContext()
  const { user } = useAuthContext()
  const { showMap, setShowMap } = useMapToggle()
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isLoadingTask, setIsLoadingTask] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [existingIssue, setExistingIssue] = useState<{ html_url: string } | null>(null)
  const [isCheckingIssue, setIsCheckingIssue] = useState(false)
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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col p-6">
          {/* Challenge Name Header */}
          <div className="flex items-start justify-between gap-4 pb-6">
            <h1 className="line-clamp-2 font-bold text-2xl leading-tight text-zinc-900 dark:text-zinc-50">
              {challenge.name}
            </h1>
            {challenge.featured && (
              <Badge
                variant="secondary"
                className="shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm dark:from-blue-600 dark:to-blue-700"
              >
                POPULAR
              </Badge>
            )}
          </div>

          <Separator />

          {/* Metadata Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {/* Project Section - Fully Clickable */}
            {projectId ? (
              <Link
                to="/project/$projectId"
                params={{ projectId: String(projectId) }}
                className="group flex cursor-pointer flex-col items-center gap-3 border-zinc-200/50 border-r p-6 text-center transition-all hover:bg-zinc-50/50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 transition-all group-hover:bg-blue-500/20 dark:bg-blue-400/10 dark:group-hover:bg-blue-400/20">
                  <FolderKanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
                    Project
                  </span>
                  <span className="font-medium text-sm text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400 group-hover:dark:text-blue-300">
                    {projectName}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-3 border-zinc-200/50 border-r p-6 text-center dark:border-zinc-800/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-400/10">
                  <FolderKanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
                    Project
                  </span>
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                    {projectName}
                  </span>
                </div>
              </div>
            )}

            {/* Creator Section - Fully Clickable */}
            {ownerName && ownerName !== 'Unknown' ? (
              <a
                href={`https://www.openstreetmap.org/user/${encodeURIComponent(ownerName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex cursor-pointer flex-col items-center gap-3 border-zinc-200/50 border-r p-6 text-center transition-all hover:bg-zinc-50/50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 transition-all group-hover:bg-purple-500/20 dark:bg-purple-400/10 dark:group-hover:bg-purple-400/20">
                  <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
                    Creator
                  </span>
                  <span className="flex items-center justify-center gap-1.5 font-medium text-sm text-purple-600 transition-colors group-hover:text-purple-700 dark:text-purple-400 group-hover:dark:text-purple-300">
                    {ownerName}
                    <ExternalLink className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
                  </span>
                </div>
              </a>
            ) : (
              <div className="flex flex-col items-center gap-3 border-zinc-200/50 border-r p-6 text-center dark:border-zinc-800/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 dark:bg-purple-400/10">
                  <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
                    Creator
                  </span>
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                    {ownerName}
                  </span>
                </div>
              </div>
            )}

            {/* Difficulty Section */}
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-400/10">
                <Target className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
                  Difficulty
                </span>
                <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                  {getDifficultyLabel(challenge.difficulty)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description Section */}
          <div className="flex flex-col gap-3 p-6">
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">Description</h2>
            </div>
            <div className="relative">
              <div
                className={`text-sm text-zinc-700 leading-relaxed transition-all dark:text-zinc-300 ${
                  isDescriptionExpanded ? '' : 'max-h-24 overflow-hidden'
                }`}
              >
                <p>{challenge.description || 'No description available.'}</p>
                {challenge.blurb && (
                  <p className="mt-3 text-zinc-600 italic dark:text-zinc-400">{challenge.blurb}</p>
                )}
              </div>
              {(challenge.description || challenge.blurb) &&
                (challenge.description?.length || 0) > 100 && (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-3 flex items-center gap-1.5 font-medium text-blue-600 text-xs transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {isDescriptionExpanded ? (
                      <>
                        Show less <ChevronUp className="size-3" />
                      </>
                    ) : (
                      <>
                        Show more <ChevronDown className="size-3" />
                      </>
                    )}
                  </button>
                )}
            </div>
          </div>

          {/* Progress Section */}
          {challenge.completionPercentage !== undefined && (
            <>
              <Separator />
              <div className="flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">Progress</span>
                  </div>
                  <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
                    {challenge.completionPercentage}%
                  </span>
                </div>
                <Progress
                  value={challenge.completionPercentage}
                  className="h-2.5 bg-zinc-200/30 dark:bg-zinc-700/30"
                />
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Sticky Bottom Section */}
      <div className="border-zinc-200/50 border-t p-6 backdrop-blur-sm dark:border-zinc-800/50">
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
