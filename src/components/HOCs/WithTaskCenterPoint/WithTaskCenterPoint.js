import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AsMappable from '../../../services/Task/AsMappable'

export default function(WrappedComponent) {
  class WithTaskCenterPoint extends Component {
    render() {
      const mappableTask = AsMappable(this.props.task)
      return <WrappedComponent centerPoint={mappableTask.calculateCenterPoint()}
                               {...this.props} />
    }
  }

  WithTaskCenterPoint.propTypes = {
    task: PropTypes.object.isRequired,
  }

  return WithTaskCenterPoint
}
