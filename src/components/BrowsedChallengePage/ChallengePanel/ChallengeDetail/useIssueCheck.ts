import { useEffect, useState } from 'react'
import { useBrowsedChallengeContext } from '@/contexts/browseChallenge/BrowsedChallengeContext'

export const useIssueCheck = () => {
  const { challenge } = useBrowsedChallengeContext()
  const [existingIssue, setExistingIssue] = useState<{ html_url: string } | null>(null)
  const [isCheckingIssue, setIsCheckingIssue] = useState(false)

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

  return {
    existingIssue,
    isCheckingIssue,
    isFlaggingActive,
    checkForIssue,
  }
}
