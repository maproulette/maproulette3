import { useEffect } from 'react'
import { useExploreChallengesMapContext } from '../../ExploreChallengesMapContext'
import { cleanupPopups } from '../utils/mapCleanup'

/**
 * Manages cleanup of task marker popups when component unmounts
 */
export const TaskMarkerCleanupManager = () => {
  const { map } = useExploreChallengesMapContext()

  useEffect(() => {
    return () => {
      if (map.current) {
        cleanupPopups(map.current)
      } else {
        cleanupPopups()
      }
    }
  }, [map])

  return null
}
