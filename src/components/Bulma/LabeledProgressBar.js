import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedNumber } from 'react-intl'
import classNames from 'classnames'
import _isFinite from 'lodash/isFinite'
import './LabeledProgressBar.scss'

/**
 * LabeledProgressBar displays a Bulma `progress` component, along with
 * a label and description of the value.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class LabeledProgressBar extends Component {
  render() {
    return (
      <div className={classNames('labeled-progress', this.props.className)}>
        <div className="description">
          <div className="progress-label">{this.props.label}</div>
          <div className="progress-made">
            {_isFinite(this.props.value) &&
             <span className="value">
               <FormattedNumber value={this.props.value} />
             </span>
            }
            {_isFinite(this.props.max) &&
             <span className="max"> / <FormattedNumber value={this.props.max} /></span>
            }
          </div>
        </div>
        <div className="visual">
          <progress className={classNames('progress',
                                          {"is-small": !this.props.isMedium,
                                           "is-medium": this.props.isMedium})}
                    value={this.props.value}
                    max={this.props.max} />
        </div>
      </div>
    )
  }
}

LabeledProgressBar.propTypes = {
  /** Label for the progress bar */
  label: PropTypes.string,
  /** Current progress value */
  value: PropTypes.number,
  /** Max possible (completed) value */
  max: PropTypes.number,
  /** Set to true for a larger progress bar */
  isMedium: PropTypes.bool,
}

LabeledProgressBar.defaultProps = {
  isMedium: false,
}
