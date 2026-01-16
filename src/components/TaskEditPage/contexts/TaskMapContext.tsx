import type { ReactNode } from 'react'
import { MapContextProvider, useMapContext } from '@/contexts/MapContext'

export const TaskMapContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <MapContextProvider
      mapId="taskMap"
      initialCenter={[0, 0]}
      initialZoom={0}
      initialStyleId="osm-us-vector"
    >
      {children}
    </MapContextProvider>
  )
}

export const useTaskMapContext = useMapContext
