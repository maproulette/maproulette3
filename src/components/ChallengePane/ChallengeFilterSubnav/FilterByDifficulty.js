import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _map from 'lodash/map'
import _isFinite from 'lodash/isFinite'
import { injectIntl, FormattedMessage } from 'react-intl'
import { ChallengeDifficulty, difficultyLabels, messagesByDifficulty }
       from '../../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'
import Dropdown from '../../Dropdown/Dropdown'
import ButtonFilter from './ButtonFilter'
import messages from './Messages'

/**
 * FilterByDifficulty displays a nav dropdown containing options for filtering
 * challenges by difficulty or suggested experience. The challenge filter in
 * the redux store is updated to reflect the selected difficulty option
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class FilterByDifficulty extends Component {
  /**
   * Update the challenge filter with the selected value.
   *
   * @private
   */
  updateFilter = (value, closeDropdown) => {
    if (!_isFinite(value)) {
      this.props.removeSearchFilters(['difficulty'])
    }
    else {
      this.props.setSearchFilters({difficulty: value})
    }
    closeDropdown()
  }

  render() {
    const localizedDifficultyLabels = difficultyLabels(this.props.intl)
    const notFiltering = !_isFinite(this.props.searchFilters.difficulty)

    return (
      <Dropdown
        className="mr-dropdown--flush xl:mr-border-l xl:mr-border-white-10 mr-p-6 mr-pl-0 xl:mr-pl-6"
        dropdownButton={dropdown =>
          <ButtonFilter
            type={<FormattedMessage {...messages.difficultyLabel} />}
            selection={
              notFiltering ?
              localizedDifficultyLabels.any :
              <FormattedMessage {...messagesByDifficulty[this.props.searchFilters.difficulty]} />
            }
            selectionClassName={notFiltering ? null : 'mr-text-yellow'}
            onClick={dropdown.toggleDropdownVisible}
          />
        }
        dropdownContent = {dropdown =>
          <ListDifficultyTypes
            difficultyLabels={localizedDifficultyLabels}
            updateFilter={this.updateFilter}
            closeDropdown={dropdown.closeDropdown}
          />
        }
      />
    )
  }
}

const ListDifficultyTypes = function(props) {
  const menuItems = _map(ChallengeDifficulty, (difficulty, name) => (
    <li key={difficulty}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a onClick={() => props.updateFilter(difficulty, props.closeDropdown)}>
        {props.difficultyLabels[name]}
      </a>
    </li>
  ))

  // Add 'Any' option to start of dropdown
  menuItems.unshift(
    <li key='any'>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a onClick={() => props.updateFilter(null, props.closeDropdown)}>
        {props.difficultyLabels.any}
      </a>
    </li>
  )

  return (
    <ol className="mr-list-dropdown mr-list-dropdown--ruled">
      {menuItems}
    </ol>
  )
}

FilterByDifficulty.propTypes = {
  /** Invoked to update the challenge difficulty filter */
  setSearchFilters: PropTypes.func.isRequired,
  /** Invoked to clear the challenge difficulty filter */
  removeSearchFilters: PropTypes.func.isRequired,
  /** The current value of the challenge filter */
  searchFilters: PropTypes.object,
  /** Set to true to render as a list instead of a dropdown */
  asMenuList: PropTypes.bool,
}

FilterByDifficulty.defaultProps = {
  searchFilters: {},
}

export default injectIntl(FilterByDifficulty)
