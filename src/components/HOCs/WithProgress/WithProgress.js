import React, { Component } from 'react'
import _upperFirst from 'lodash/upperFirst'

/**
 * WithProgress manages an inProgress status for a named operation along with
 * an optional number of steps completed so far as part of the operation
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithProgress = function(WrappedComponent, operationName) {
  return class extends Component {
    state = {
      inProgress: false,
      stepsCompleted: 0,
    }

    updateProgress = (inProgress, stepsCompleted) => {
      this.setState({inProgress, stepsCompleted})
    }

    render() {
      // Merge in any other progress statuses
      const allProgress = Object.assign({}, this.props.progress, {
        [operationName]: {
          inProgress: this.state.inProgress,
          stepsCompleted: this.state.stepsCompleted,
        }
      })

      return <WrappedComponent {...this.props}
                               progress={allProgress}
                               {...{[`update${_upperFirst(operationName)}Progress`]: this.updateProgress}} />
    }
  }
}

export default WithProgress
