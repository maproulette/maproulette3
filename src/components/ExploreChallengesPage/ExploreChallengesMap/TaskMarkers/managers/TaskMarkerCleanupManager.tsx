import { useEffect } from 'react'
import { cleanupPopups } from '../utils/mapCleanup'

/**
 * Manages cleanup of task marker popups when component unmounts
 */
export const TaskMarkerCleanupManager = () => {
  useEffect(() => {
    return () => {
      cleanupPopups()
    }
  }, [])

  return null
}

