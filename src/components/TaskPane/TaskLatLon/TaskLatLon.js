import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import './TaskLatLon.scss'

/**
 * TaskLatLon displays the latitude and longitude of the task centerpoint, if
 * available, along with a control for copying the lat/lon to the user's
 * clipboard.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskLatLon extends Component {
  rounded = value => Number(value.toFixed(7)) // 7 digits max precision

  render() {
    const centerpoint = AsMappableTask(this.props.task).calculateCenterPoint()
    if (!centerpoint || (centerpoint.lat === 0 && centerpoint.lng === 0)) {
      return null
    }

    return (
      <div className={classNames('task-lat-lon mr-flex mr-items-center', this.props.className)}>
        <span className='task-lat-lon__label'>Lon/Lat:</span>
        <span className='task-lat-lon__longitude'>
          {this.rounded(centerpoint.lng)}
        </span>, <span className='task-lat-lon__latitude'>
          {this.rounded(centerpoint.lat)}
        </span>

        <CopyToClipboard text={`${this.rounded(centerpoint.lat)}, ${this.rounded(centerpoint.lng)}`}>
          <button className="mr-text-green-lighter hover:mr-text-white mr-ml-1">
            <SvgSymbol viewBox='0 0 20 20' className="mr-fill-current mr-w-4 mr-h-4" sym="clipboard-icon" />
          </button>
        </CopyToClipboard>
      </div>
    )
  }
}

TaskLatLon.propTypes = {
  task: PropTypes.object,
}
