import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import _map from 'lodash/map'
import WithDeactivateOnOutsideClick
       from '../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import DropdownButton from '../Bulma/DropdownButton'
import messages from './Messages'
import './PastDurationSelector.scss'

const DeactivatableDropdownButton = WithDeactivateOnOutsideClick(DropdownButton)

/**
 * PastDurationSelector renders an unmanaged dropdown button that can be used
 * to select a past number of months or years.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class PastDurationSelector extends Component {
  onSelect = selection => {
    this.props.selectDuration(selection.value)
  }

  render() {
    const dropdownOptions = _map(this.props.pastMonthsOptions, months => ({
      key: months,
      text: this.props.intl.formatMessage(messages.pastMonthsOption, {months}),
      value: months,
    }))

    return (
      <DeactivatableDropdownButton
        className={classNames("past-duration-selector", this.props.className)}
        options={dropdownOptions}
        onSelect={this.onSelect}
      >
        <div className="button is-rounded is-outlined">
          <FormattedMessage {...messages.pastMonthsOption}
                            values={{months: this.props.currentMonthsPast}} />
          <div className="dropdown-indicator" />
        </div>
      </DeactivatableDropdownButton>
    )
  }
}

PastDurationSelector.propTypes = {
  /**
   * Array of past-months options, such as [1, 6, 12] to offer 1 month ago, 6
   * months ago, and 1 year ago.
   */
  pastMonthsOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  /** Current selection */
  currentMonthsPast: PropTypes.number.isRequired,
  /** Invoked when the user chooses a new duration */
  selectDuration: PropTypes.func.isRequired,
}

export default injectIntl(PastDurationSelector)
