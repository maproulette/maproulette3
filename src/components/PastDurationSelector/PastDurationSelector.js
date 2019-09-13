import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import _map from 'lodash/map'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './PastDurationSelector.scss'

export const ALL_TIME = -1
export const CURRENT_MONTH = 0

/**
 * PastDurationSelector renders an unmanaged dropdown button that can be used
 * to select a past number of months or years.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class PastDurationSelector extends Component {
  pickDuration = (months, closeDropdown) => {
    this.props.selectDuration(months)
    closeDropdown()
  }

  render() {
    return (
      <Dropdown
        className={this.props.className}
        dropdownButton={dropdown =>
          <DurationButton
            {...this.props}
            toggleDropdownVisible={dropdown.toggleDropdownVisible}
          />
        }
        dropdownContent={dropdown =>
          <ListDurationItems
            pastMonthsOptions={this.props.pastMonthsOptions}
            pickDuration={this.pickDuration}
            closeDropdown={dropdown.closeDropdown}
          />
        }
      />
    )
  }
}

const DurationButton = function(props) {
  return (
    <button
      className="mr-dropdown__button"
      onClick={props.toggleDropdownVisible}
    >
      <span className="mr-flex">
        <span className="mr-mr-2">
          {props.currentMonthsPast > CURRENT_MONTH &&
                 <FormattedMessage {...messages.pastMonthsOption}
                            values={{months: props.currentMonthsPast}} />}
          {props.currentMonthsPast === CURRENT_MONTH &&
                 <FormattedMessage {...messages.currentMonthOption}
                            values={{months: props.currentMonthsPast}} />}
          {props.currentMonthsPast <= ALL_TIME &&
                 <FormattedMessage {...messages.allTimeOption}
                            values={{months: props.currentMonthsPast}} />}
        </span>
        <SvgSymbol
          sym="icon-cheveron-down"
          viewBox="0 0 20 20"
          className="mr-fill-current mr-w-5 mr-h-5"
        />
      </span>
    </button>
  )
}

const ListDurationItems = function(props) {
  const menuItems = _map(props.pastMonthsOptions, months => (
    <li key={months}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a onClick={() => props.pickDuration(months, props.closeDropdown)}>
        {months > CURRENT_MONTH  && <FormattedMessage {...messages.pastMonthsOption} values={{months}} />}
        {months === CURRENT_MONTH  && <FormattedMessage {...messages.currentMonthOption} />}
        {months <= ALL_TIME  && <FormattedMessage {...messages.allTimeOption} />}
      </a>
    </li>
  ))

  return (
    <ol className="mr-list-dropdown">
      {menuItems}
    </ol>
  )
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
