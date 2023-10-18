import React from 'react'
import useMRProperties from '../../../hooks/UseMRProperties/UseMRProperties'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'

/**
 * WithTaskFeatureProperties provides task feature properties derived
 * from the useMRProperties hook and the AsMappableTask interaction.
 * Both property sets are combined and passed as props to wrapped components.
 */


const WithTaskFeatureProperties = (Component) => {
  return function(props) {
    const allFeatureProperties = AsMappableTask(props.task).allFeatureProperties()
    const mrProperties = useMRProperties(props.workspaceContext)
    const allProperties = Object.assign({}, mrProperties, allFeatureProperties)
    
    return (<Component {...props} taskFeatureProperties={allProperties}/>)
  }
}

export default WithTaskFeatureProperties