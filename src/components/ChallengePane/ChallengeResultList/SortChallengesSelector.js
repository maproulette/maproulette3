import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { injectIntl } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import { sortLabels, SORT_DEFAULT } from '../../../services/Search/Search'
import WithDeactivateOnOutsideClick
       from '../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import DropdownButton from '../../Bulma/DropdownButton'
import './SortChallengesSelector.css'

const DeactivatableDropdownButton = WithDeactivateOnOutsideClick(DropdownButton)

/**
 * SortChallengesSelector renders an unmanaged dropdown button that can be used
 * to modify the sort order of challenge results.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class SortChallengesSelector extends Component {
  onSelect = selection => {
    this.props.setSearchSort({sortBy: selection.value})
  }

  render() {
    const localizedLabels = sortLabels(this.props.intl)

    const dropdownOptions = _map(this.props.sortOptions, sortBy => ({
      key: sortBy,
      text: localizedLabels[sortBy],
      value: sortBy,
    }))

    const currentSortCriteria = _get(this.props, 'searchSort.sortBy')
    const activeLabel = currentSortCriteria ? localizedLabels[currentSortCriteria] :
                        localizedLabels[SORT_DEFAULT]

    return (
      <DeactivatableDropdownButton
        className={classNames("sort-challenges-selector", this.props.className)}
        options={dropdownOptions}
        onSelect={this.onSelect}
      >
        <div className="button is-rounded is-outlined">
          {activeLabel} <div className="dropdown-indicator" />
        </div>
      </DeactivatableDropdownButton>
    )
  }
}

SortChallengesSelector.propTypes = {
  /** Invoked to sort the challenges when a value is selected */
  setSearchSort: PropTypes.func.isRequired,
}

export default injectIntl(SortChallengesSelector)
