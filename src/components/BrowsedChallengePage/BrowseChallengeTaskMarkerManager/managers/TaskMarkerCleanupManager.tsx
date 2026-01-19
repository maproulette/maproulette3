import { useEffect } from 'react'
import { useBrowseChallengeMapContext } from '../../contexts/BrowseChallengeMapContext'
import { cleanupPopups } from '../utils/mapCleanup'

/**
 * Manages cleanup of task marker popups when component unmounts
 */
export const TaskMarkerCleanupManager = () => {
  const { map } = useBrowseChallengeMapContext()

  useEffect(() => {
    return () => {
      cleanupPopups(map.current ?? undefined)
    }
  }, [map])

  return null
}
