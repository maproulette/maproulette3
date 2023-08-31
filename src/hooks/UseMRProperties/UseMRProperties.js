import { useState, useEffect } from 'react'
import AsMappableTask from '../../interactions/Task/AsMappableTask'
import AsIdentifiableFeature
       from '../../interactions/TaskFeature/AsIdentifiableFeature'

/**
 * useMRProperties hook returns an object containing substitution properties
 * (for mustache tags found in markdown content) based on the data in the given
 * workspaceContext, such as the current map location and task id.
 *
 * Note that these are separate from the actual task properties, and all of the
 * properties returned by this hook begin with `#` to help distinguish them
 * from task properties
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const useMRProperties = workspaceContext => {
  const [properties, setProperties] = useState({})

  useEffect(() => {
    if(!workspaceContext){
      return null
    }

    const mrProperties = {
      '#mapZoom': workspaceContext['taskMapZoom'],
    }

    const task = workspaceContext['taskMapTask']
    if (task) {
      const primaryFeature =
        AsIdentifiableFeature(AsMappableTask(task).normalizedGeometries().features[0])

      mrProperties['#mrTaskId'] = task.id
      mrProperties['#osmId'] = primaryFeature.osmId()
      mrProperties['#osmType'] = primaryFeature.osmType()

      //map the task specific properties to the workspace properties
      const { properties } = primaryFeature;
      if (properties) {
        Object.keys(properties).map((key) => {
          mrProperties[key] = properties[key];
          return null;
        });
      }
    }

    const mapBounds = workspaceContext['taskMapBounds']
    if (mapBounds) {
      mrProperties['#mapLat'] = mapBounds.getCenter().lat
      mrProperties['#mapLon'] = mapBounds.getCenter().lng
      mrProperties['#mapBBox'] = mapBounds.toBBoxString()
      mrProperties['#mapWest'] = mapBounds.getWest()
      mrProperties['#mapSouth'] = mapBounds.getSouth()
      mrProperties['#mapEast'] = mapBounds.getEast()
      mrProperties['#mapNorth'] = mapBounds.getNorth()
    }

    setProperties(mrProperties)
  }, [workspaceContext])

  return properties
}

export default useMRProperties
