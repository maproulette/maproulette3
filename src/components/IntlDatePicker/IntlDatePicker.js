import React, { Component } from 'react'
import DatePicker from 'react-datepicker'
import subYears from 'date-fns/sub_years'


/**
 * IntlDatePicker is DatePicker with the dateFormat set to the current intl
 * date format.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class IntlDatePicker extends Component {

  // This is a funky method to extract the date format to use for the date picker
  // since react intl will not give us the date format directly
  extractDateFormat() {
    const isoString = '2018-12-31T12:00:00.000Z' // example date

    const intlString = this.props.intl.formatDate(isoString) // generate a formatted date
    const dateParts = isoString.split('T')[0].split('-') // prepare to replace with pattern parts

    return intlString
      .replace(dateParts[2], 'dd')
      .replace(dateParts[1], 'MM')
      .replace(dateParts[0], 'yyyy')
  }

  render() {
    const extraProps = {}
    if (this.props.limitDate) {
      extraProps.minDate = subYears(new Date(), 1)
    }

    return (
      <DatePicker
          dateFormat={this.extractDateFormat()}
          selected={this.props.selected}
          onChange={this.props.onChange}
          popperPlacement="bottom"
          popperModifiers={{
              flip: {
                behavior: ["bottom"] // don't allow it to flip to be above
              },
              preventOverflow: {
                enabled: false // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
              },
              hide: {
                enabled: false // turn off since needs preventOverflow to be enabled
              }
          }}
          {...extraProps}
      />
    )
  }
}
