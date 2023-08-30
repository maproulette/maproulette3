import React from 'react'
import useMRProperties from '../../../hooks/UseMRProperties/UseMRProperties'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'

const WithTaskFeatureProperties = (Component) => {
  return function(props) {
    const allFeatureProperties = AsMappableTask(props.task).allFeatureProperties()
    const mrProperties = useMRProperties(props.workspaceContext)
    const allProperties = Object.assign({}, mrProperties, allFeatureProperties)
    
    return (<Component {...props} taskFeatureProperties={allProperties}/>)
  }
}

export default WithTaskFeatureProperties