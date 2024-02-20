import React, { Component } from 'react'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import { FormattedMessage } from 'react-intl'
import messages from './Messages'

/**
 * SavedSearchFilters renders a list of saved search filters
 * with a link to edit/delete each one and a link to save
 * your current search filters.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class SavedFiltersList extends Component {
  render() {
    const savedFilters = this.props.savedFilters

    const listSearches = _map(_keys(savedFilters), (search, index) => {
      const searchURL = savedFilters[search]
      const briefFilters = this.props.getBriefFilters(searchURL).join('\n')

      return (
        <li key={search + "-" + index}>
          <a onClick={() => {
              this.props.history.push({
                pathname: this.props.history.location.pathname,
                search: searchURL,
                state: {refresh: true}
              })
              this.props.afterClick()
            }
          } title={briefFilters}>
            {search}
          </a>
        </li>
      )
    })

    return (
      <React.Fragment>
        <li>
          <button className="mr-text-current"
                  onClick={() => {this.props.saveFilters(); this.props.afterClick()}}>
            <FormattedMessage {...messages.saveFiltersLabel} />
          </button>
        </li>
        {listSearches.length > 0 &&
          <li>
            <button className="mr-text-current"
                    onClick={() => {this.props.manageFilters(); this.props.afterClick()}}>
              <FormattedMessage {...messages.manageFiltersLabel} />
            </button>
          </li>
        }
        <li><hr className="mr-rule-dropdown" /></li>
        {listSearches.length > 0 &&
          <li>
            <h5 className="mr-text-orange">
              <FormattedMessage {...messages.savedFiltersTitle} />
            </h5>
          </li>
        }
        {listSearches}
      </React.Fragment>
    )
  }
}
