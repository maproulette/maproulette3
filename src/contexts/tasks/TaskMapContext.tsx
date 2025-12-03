/**
 * Task Map Context - used for the task editing/completion page
 */
import { createMapContext } from '@/utils/createMapContext'

export type { BaseMapContextType as TaskMapContextType } from '@/utils/createMapContext'

const { Provider, useContext, Context } = createMapContext({
  mapId: 'taskMap',
  initialCenter: [0, 0],
  initialZoom: 0,
  initialStyleId: 'osm-us-vector',
})

export const TaskMapContextProvider = Provider
export const useTaskMapContext = useContext
export const TaskMapContext = Context
