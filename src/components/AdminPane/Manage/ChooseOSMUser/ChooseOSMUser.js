import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import classNames from 'classnames'
import Downshift from 'downshift'
import _map from 'lodash/map'
import WithOSMUserSearch from '../../HOCs/WithOSMUserSearch/WithOSMUserSearch'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import messages from './Messages'
import './ChooseOSMUser.css'

/**
 * ChooseOSMUser makes it easy to find MapRoulette users by OSM username. The
 * component presents an input field where users can enter an OSM username or
 * username fragment, kicking off a search for matching usernames.  Results are
 * displayed in a dropdown so that the user can choose the desired username.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChooseOSMUser extends Component {
  usernameChanged = username => {
    this.props.searchOSMUser(username)

    if (this.props.onInputValueChange) {
      this.props.onInputValueChange(username)
    }
  }

  render() {
    return (
      <Downshift {...this.props}
                 onInputValueChange={this.usernameChanged}
                 itemToString={osmUser => osmUser? osmUser.displayName : ''}>
        {({getInputProps, getItemProps, getMenuProps, isOpen, inputValue}) => {
          const resultOptions =
            this.props.osmUserResults.length > 0 ?
            _map(this.props.osmUserResults, osmUser => (
              <a {...getItemProps({key: osmUser.osmId, item: osmUser, className: "dropdown-item"})}>
                {osmUser.displayName}
              </a>
            )) :
            <div className="choose-osm-user__no-results">
              <FormattedMessage {...messages.noResults} />
            </div>

          return (
            <div className={classNames("dropdown choose-osm-user",
                                      {"is-active": isOpen && inputValue.length > 0})}>
              <div className="choose-osm-user__input-wrapper">
                <input {...getInputProps()} className="input"
                      placeholder={this.props.intl.formatMessage(messages.osmUsername)}
                />
                {this.props.isSearchingOSMUsers && <BusySpinner inline />}
              </div>
              <div className="dropdown-menu">
                <div {...getMenuProps({className: "dropdown-content"})}>
                  {resultOptions}
                </div>
              </div>
            </div>
          )
        }}
      </Downshift>
    )
  }
}

ChooseOSMUser.propTypes = {
  onChange: PropTypes.func,
}

export default WithOSMUserSearch(injectIntl(ChooseOSMUser))
