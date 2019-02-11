import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './PastDurationSelector.scss'

/**
 * PastDurationSelector renders an unmanaged dropdown button that can be used
 * to select a past number of months or years.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class PastDurationSelector extends Component {
  render() {
    const menuItems = _map(this.props.pastMonthsOptions, months => (
      <li key={months}>
        <Link to={{}} onClick={() => this.props.selectDuration(months)}>
          <FormattedMessage {...messages.pastMonthsOption} values={{months}} />
        </Link>
      </li>
    ))

    return (
      <Dropdown
        className={this.props.className}
        button={<DurationButton  {...this.props} />}
      >
        <ol className="mr-list-dropdown">
          {menuItems}
        </ol>
      </Dropdown>
    )
  }
}

const DurationButton = function(props) {
  return (
    <span className="mr-flex">
      <span className="mr-mr-2">
        <FormattedMessage {...messages.pastMonthsOption}
                          values={{months: props.currentMonthsPast}} />
      </span>
      <SvgSymbol
        sym="icon-cheveron-down"
        viewBox="0 0 20 20"
        className="mr-fill-current mr-w-5 mr-h-5"
      />
    </span>
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
