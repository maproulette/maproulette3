import { useEffect } from 'react'
import { useTaskMapContext } from '../../../../../contexts/TaskMapContext'
import { cleanupPopups } from '../utils/mapCleanup'

/**
 * Manages cleanup of task marker popups when component unmounts
 */
export const TaskMarkerCleanupManager = () => {
  const { map } = useTaskMapContext()

  useEffect(() => {
    return () => {
      cleanupPopups(map.current ?? undefined)
    }
  }, [map])

  return null
}
