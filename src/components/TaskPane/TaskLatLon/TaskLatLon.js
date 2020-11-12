import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import messages from './Messages'

/**
 * TaskLatLon displays the latitude and longitude of the task centerpoint, if
 * available, along with a control for copying the lat/lon to the user's
 * clipboard
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

    const latLon = this.props.intl.formatMessage(messages.latLonValue, {
      lat: this.rounded(centerpoint.lat),
      lon: this.rounded(centerpoint.lng),
    })

    return (
      <div className={classNames('mr-flex mr-items-center', this.props.className)}>
        <span className="mr-mr-2">
          <FormattedMessage {...messages.latLonLabel} />
        </span>
        <span>{latLon}</span>

        <CopyToClipboard text={latLon}>
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
}

export default injectIntl(TaskLatLon)
