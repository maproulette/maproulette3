import React, { useState, Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
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
  pickCountry = (countryCode, closeDropdown) => {
    this.props.selectCountry(countryCode)
    closeDropdown()
  }

  render() {
    return (
      <Dropdown
        className={this.props.className}
        dropdownButton={dropdown =>
          <CountryButton
            {...this.props}
            toggleDropdownVisible={dropdown.toggleDropdownVisible}
          />
        }
        dropdownContent={dropdown =>
          <ListCountryItems
            intl={this.props.intl}
            pickCountry={this.pickCountry}
            closeDropdown={dropdown.closeDropdown}
          />
        }
      />
    )
  }
}

const CountryButton = function(props) {
  return (
    <button
      className="mr-dropdown__button"
      onClick={props.toggleDropdownVisible}
    >
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
    </button>
  )
}

const ListCountryItems = function(props) {

  const [searchInput, setSearchInput] = useState('')
  const [filteredCountries, setFilteredCountries] = useState(countryList)

  const countryList = _sortBy(
    _each(supportedCountries(), country => {
      country.name =
        props.intl.formatMessage(countryMessages[country.countryCode])
    }),
    'name'
  )

  const menuDisplay = () => menuItems= _map(countryList, country => (
    <li key={country.countryCode}>
      <a onClick={() => props.pickCountry(country.countryCode, props.closeDropdown)}>
        {country.name}
      </a>
    </li>
  ))

  const filteredMenuDisplay = () => filteredCountries= _map(countryList, country => (
    <li key={country.countryCode}>
      <a onClick={() => props.pickCountry(country.countryCode, props.closeDropdown)}>
        {country.name}
      </a>
    </li>
  ))

  const searchCountries = (event) => {
    setSearchInput(event.target.value)
    if(event.target.value !== ''){
      const filteredData = menuItems.filter(country => country.name.toLowerCase().includes(searchInput.toLowerCase()))
      setFilteredCountries(filteredData)
    }
    else{
      setFilteredCountries(menuItems)
    }
}

  // Add option for "All Countries" that goes to standard (global) leaderboard
  menuItems.unshift(
    <li key="ALL">
      <a onClick={() => props.pickCountry("ALL", props.closeDropdown)}>
        <FormattedMessage {...countryMessages.ALL} />
      </a>
    </li>
  )

  return (
    <ol className="mr-list-dropdown">
      <div>
          <input 
                type="text"
                style={{color: 'black'}}
                placeholder='Search By Country'
                onChange={searchCountries}
            />
      </div>
      <br />
      {menuItems.length > 0 ? filteredMenuDisplay() : menuDisplay()}
    </ol>
  )
}

CountrySelector.propTypes = {
  /** Current selection */
  currentCountryCode: PropTypes.string,
  /** Invoked when the user chooses a new country */
  selectCountry: PropTypes.func.isRequired,
}

export default injectIntl(CountrySelector)
