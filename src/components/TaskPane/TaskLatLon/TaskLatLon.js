import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import messages from './Messages'

/**
 * TaskLatLon displays the longitude and latitude of the task centerpoint, if
 * available, along with a control for copying the lon/lat to the user's
 * clipboard (or lat/lon if reverse prop is given)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class TaskLatLon extends Component {
  rounded = value => Number(value.toFixed(7)) // 7 digits max precision

  render() {
    const centerpoint = AsMappableTask(this.props.task).calculateCenterPoint()
    if (!centerpoint || (centerpoint.lat === 0 && centerpoint.lng === 0)) {
      return null
    }

    const value = this.props.intl.formatMessage(
      this.props.reverse ? messages.latLonValue : messages.lonLatValue,
      {
        lat: this.rounded(centerpoint.lat),
        lon: this.rounded(centerpoint.lng),
      }
    )

    return (
      <div className={classNames('mr-flex mr-items-center', this.props.className)}>
        <span className="mr-mr-2">
          <FormattedMessage
            {...(this.props.reverse ? messages.latLonLabel : messages.lonLatLabel)}
          />
        </span>
        <span>{value}</span>

        <CopyToClipboard text={value}>
          <button className="mr-text-green-lighter hover:mr-text-white mr-ml-1">
            <SvgSymbol
              sym="clipboard-icon"
              viewBox='0 0 20 20'
              className="mr-fill-current mr-w-4 mr-h-4"
            />
          </button>
        </CopyToClipboard>
      </div>
    )
  }
}

TaskLatLon.propTypes = {
  task: PropTypes.object,
  reverse: PropTypes.bool,
}

TaskLatLon.defaultProps = {
  reverse: false,
}

export default injectIntl(TaskLatLon)
