import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'
import _sortBy from 'lodash/sortBy'
import _each from 'lodash/each'
import Dropdown from '../Dropdown/Dropdown'
import { supportedCountries } from '../../services/Leaderboard/CountryBoundingBoxes'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import countryMessages from './Messages'
import './CountrySelector.scss'

/**
 * CountrySelector renders an unmanaged dropdown button that can be used
 * to select a country where the value returned is a country code.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class CountrySelector extends Component {
  render() {
    const countryList = _sortBy(
      _each(supportedCountries(), country => {
        country.name =
          this.props.intl.formatMessage(countryMessages[country.countryCode])
      }),
      'name'
    )

    const menuItems = _map(countryList, country => (
      <li key={country.countryCode}>
        <Link to={{}} onClick={() => this.props.selectCountry(country.countryCode)}>
          {country.name}
        </Link>
      </li>
    ))

    // Add option for "All Countries" that goes to standard (global) leaderboard
    menuItems.unshift(
      <li key="ALL">
        <Link to={{}} onClick={() => this.props.selectCountry("ALL")}>
          <FormattedMessage {...countryMessages.ALL} />
        </Link>
      </li>
    )

    return (
      <Dropdown
        className={this.props.className}
        button={<CountryButton  {...this.props} />}
      >
        <ol className="mr-list-dropdown">
          {menuItems}
        </ol>
      </Dropdown>
    )
  }
}

const CountryButton = function(props) {
  return (
    <span className="mr-flex">
      <span className="mr-mr-2">
        { !props.currentCountryCode ?
          <FormattedMessage {...countryMessages["ALL"]} /> :
          <FormattedMessage {...countryMessages[props.currentCountryCode]} />
        }
      </span>
      <SvgSymbol
        sym="icon-cheveron-down"
        viewBox="0 0 20 20"
        className="mr-fill-current mr-w-5 mr-h-5"
      />
    </span>
  )
}

CountrySelector.propTypes = {
  /** Current selection */
  currentCountryCode: PropTypes.string,
  /** Invoked when the user chooses a new country */
  selectCountry: PropTypes.func.isRequired,
}

export default injectIntl(CountrySelector)
