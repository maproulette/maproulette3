import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl'
import _map from 'lodash/map'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import IntlDatePicker from '../IntlDatePicker/IntlDatePicker'
import messages from './Messages'
import './PastDurationSelector.scss'

export const ALL_TIME = -1
export const CURRENT_MONTH = 0
export const CUSTOM_RANGE = -2

/**
 * PastDurationSelector renders an unmanaged dropdown button that can be used
 * to select a past number of months or years.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class PastDurationSelector extends Component {
  state={
    showChooseCustomDates: null,
    customStartDate: new Date(),
    customEndDate: new Date(),
  }

  pickDuration = (months, closeDropdown) => {
    this.props.selectDuration(months)
    if (months === CUSTOM_RANGE && this.props.selectCustomRange) {
      this.setState({showChooseCustomDates: true})
    }
    else {
      closeDropdown()
    }
  }

  render() {
    return (
      <Dropdown
        className={classNames("mr-dropdown--right", this.props.className)}
        dropdownButton={dropdown =>
          <DurationButton
            {...this.props}
            customStartDate={this.state.customStartDate}
            customEndDate={this.state.customEndDate}
            toggleDropdownVisible={dropdown.toggleDropdownVisible}
          />
        }
        dropdownContent={dropdown => {
          if (this.state.showChooseCustomDates) {
            return (
              <div className="mr-pt-2 mr-min-w-72">
                <div className="mr-text-green-lighter mr-w-full">
                  <button className="mr-absolute mr-right-0 mr-top-0 mr-mt-2"
                    onClick={() => this.setState({showChooseCustomDates: false})}>
                    <SvgSymbol sym="outline-close-icon"
                      viewBox='0 0 20 20'
                      className="mr-fill-current mr-w-5 mr-h-5 mr-mr-1" />
                  </button>
                </div>
                <div className="mr-mt-4 mr-pb-2 mr-text-grey">
                  <div className="mr-inline-block mr-w-20 mr-text-yellow mr-pr-2">
                    <FormattedMessage {...messages.startDate} />
                  </div>
                  <IntlDatePicker
                    selected={this.state.customStartDate}
                    onChange={(value) => this.setState({customStartDate: value})}
                    intl={this.props.intl}
                  />
                </div>
                <div className="mr-pb-2 mr-text-grey">
                  <div className="mr-inline-block mr-w-20 mr-text-yellow mr-pr-2">
                    <FormattedMessage {...messages.endDate} />
                  </div>
                  <IntlDatePicker
                    selected={this.state.customEndDate}
                    onChange={(value) => this.setState({customEndDate: value})}
                    intl={this.props.intl}
                  />
                </div>
                {this.state.customStartDate && this.state.customEndDate &&
                  <button className="mr-button mr-button--small mr-button--green-lighter mr-mt-2"
                          onClick={() => {
                            this.props.selectCustomRange(
                              this.state.customStartDate,
                              this.state.customEndDate)                            
                            dropdown.closeDropdown()
                          }}>
                    <FormattedMessage {...messages.searchLabel} />
                  </button>
                }
              </div>
            )
          }
          else {
            return (
              <ListDurationItems
                pastMonthsOptions={this.props.pastMonthsOptions}
                pickDuration={this.pickDuration}
                closeDropdown={dropdown.closeDropdown}
              />
            )
          }
        }}
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
            <FormattedMessage {...messages.currentMonthOption} />}
          {props.currentMonthsPast === ALL_TIME &&
            <FormattedMessage {...messages.allTimeOption} />}
          {props.currentMonthsPast <= CUSTOM_RANGE &&
            <React.Fragment>
              <FormattedDate value={props.customStartDate} /> -
              <FormattedDate value={props.customEndDate} />
            </React.Fragment>
          }
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
        {months === ALL_TIME  && <FormattedMessage {...messages.allTimeOption} />}
        {months <= CUSTOM_RANGE  && <FormattedMessage {...messages.customRangeOption} />}
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
  /** Invoked if user chooses a custom range */
  selectCustomRange: PropTypes.func,
}

export default injectIntl(PastDurationSelector)
