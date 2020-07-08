import React from 'react'
import _map from 'lodash/map'
import defaultTimezones from '../../timezones.json'

export const DEFAULT_TIMEZONE_OFFSET = "+00:00"

/**
 * Displays a dropzone timezone picker. Uses the timezones.json
 * to build list of available timezones.
 */
const TimezonePicker = props => {
  const timezones = _map(defaultTimezones, (value, key) =>
    <option key={key} value={key.match(/\(GMT(.*?)\)/)[1]}>
      {key}
    </option>
  )

  return (
    <select
      onChange={e => props.changeTimezone(e.target.value)}
      defaultValue={props.currentTimezone || DEFAULT_TIMEZONE_OFFSET}
      className="mr-w-24 mr-select mr-text-xs mr-pr-4"
    >
      {timezones}
    </select>
  )
}

export default TimezonePicker
