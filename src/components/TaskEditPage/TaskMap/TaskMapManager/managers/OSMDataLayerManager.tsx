import { useOSMDataContext } from '@/components/TaskEditPage/contexts/OSMDataContext'
import { OSMDataLayer } from '../../OSMDataLayer'

/**
 * Manages the OSM data layer component
 */
export const OSMDataLayerManager = () => {
  const { showOSMData, osmData, showOSMElements, osmElementOrder, dataLayerOrder } =
    useOSMDataContext()
  return (
    <>
      {showOSMData && osmData && (
        <OSMDataLayer
          xmlData={osmData}
          showOSMElements={showOSMElements}
          elementOrder={osmElementOrder}
          dataLayerOrder={dataLayerOrder}
        />
      )}
    </>
  )
}
