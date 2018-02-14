import React, { Component } from 'react'
import PropTypes from 'prop-types'
import BusySpinner from '../../../BusySpinner/BusySpinner'

export default class ViewTask extends Component {
  render() {
    if (!this.props.task) {
      return <BusySpinner />
    }

    return (
      <div className="view-task">
        <pre>
          <code>
            {JSON.stringify(this.props.task.geometries, null, 4)}
          </code>
        </pre>
      </div>
    )
  }
}

ViewTask.propTypes = {
  /** The task to display */
  task: PropTypes.object,
}
