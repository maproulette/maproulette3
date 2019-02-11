import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'
import _get from 'lodash/get'
import { sortLabels, SORT_DEFAULT, ALL_SORT_OPTIONS }
       from '../../../services/Search/Search'
import Dropdown from '../../Dropdown/Dropdown'
import ButtonFilter from './ButtonFilter'
import messages from './Messages'

/**
 * SortChallengesSelector renders an unmanaged dropdown button that can be used
 * to modify the sort order of challenge results.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class SortChallengesSelector extends Component {
  render() {
    const localizedLabels = sortLabels(this.props.intl)
    const menuItems = _map(ALL_SORT_OPTIONS, sortByOption => (
      <li key={sortByOption}>
        <Link to={{}} onClick={() => this.props.setSearchSort({sortBy: sortByOption})}>
          {localizedLabels[sortByOption]}
        </Link>
      </li>
    ))

    const currentSortCriteria = _get(this.props, 'searchSort.sortBy')
    const activeLabel = currentSortCriteria ? localizedLabels[currentSortCriteria] :
                        localizedLabels[SORT_DEFAULT]
    return (
      <Dropdown
        className="mr-dropdown--flush xl:mr-border-l xl:mr-border-white-10 mr-p-6 mr-pl-0 xl:mr-pl-6"
        button={
          <ButtonFilter
            type={<FormattedMessage {...messages.sortBy} />}
            selection={activeLabel}
          />
        }
      >
        <ol className="mr-list-dropdown">
          {menuItems}
        </ol>
      </Dropdown>
    )
  }
}

SortChallengesSelector.propTypes = {
  /** Invoked to sort the challenges when a value is selected */
  setSearchSort: PropTypes.func.isRequired,
}

export default injectIntl(SortChallengesSelector)
