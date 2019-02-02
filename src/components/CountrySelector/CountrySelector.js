import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import _map from 'lodash/map'
import WithDeactivateOnOutsideClick
       from '../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import DropdownButton from '../Bulma/DropdownButton'
import { supportedCountries } from '../../services/Leaderboard/CountryBoundingBoxes'
import countryMessages from '../CountryLeaderboard/Messages'
import './CountrySelector.css'

const DeactivatableDropdownButton = WithDeactivateOnOutsideClick(DropdownButton)

/**
 * CountrySelector renders an unmanaged dropdown button that can be used
 * to select a country where the value returned is a country code.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class CountrySelector extends Component {
  onSelect = selection => {
    this.props.selectCountry(selection.value)
  }

  render() {
    const dropdownOptions = _map(supportedCountries(), country => ({
      key: country.countryCode,
      text: this.props.intl.formatMessage(countryMessages[country.countryCode]),
      value: country.countryCode,
    }))

    return (
      <DeactivatableDropdownButton
        className={classNames("country-selector", this.props.className)}
        options={dropdownOptions}
        onSelect={this.onSelect}
      >
        <div className="button is-rounded is-outlined">
          <FormattedMessage {...countryMessages[this.props.currentCountryCode]} />
          <div className="dropdown-indicator" />
        </div>
      </DeactivatableDropdownButton>
    )
  }
}

CountrySelector.propTypes = {
  /** Current selection */
  currentCountryCode: PropTypes.string.isRequired,
  /** Invoked when the user chooses a new country */
  selectCountry: PropTypes.func.isRequired,
}

export default injectIntl(CountrySelector)
