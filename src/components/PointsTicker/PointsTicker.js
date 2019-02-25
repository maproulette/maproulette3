import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _map from 'lodash/map'
import _get from 'lodash/get'
import messages from './Messages'

class PointsTicker extends Component {
  digitBoxes = (score, minBoxes=4) => {
    const digits = score.toString().split('')
    const totalBoxes = minBoxes > digits.length ? minBoxes : digits.length
    const boxes = _map(digits, (digit, index) =>
      <span key={totalBoxes - index}>{digit}</span>)

    while (boxes.length < minBoxes) {
      boxes.unshift(<span key={totalBoxes - boxes.length} />)
    }

    return boxes
  }

  render() {
    if (!this.props.user) {
      return null
    }

    return (
      <div className={classNames(this.props.className)}>
        <div className="lg:mr-flex lg:mr-items-center">
          <h3 className="mr-text-xs mr-leading-loose mr-tracking-wide mr-text-yellow mr-font-medium mr-uppercase lg:mr-mr-2">
            <FormattedMessage {...messages.label} />
          </h3>
          <span className="mr-ticker mr-my-2 lg:mr-my-0">
            {this.digitBoxes(_get(this.props.user, 'score', 0), 4)}
          </span>
        </div>
      </div>
    )
  }
}

PointsTicker.propTypes = {
  user: PropTypes.object,
}

export default PointsTicker
