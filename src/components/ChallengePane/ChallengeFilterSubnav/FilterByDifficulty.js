import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
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
  updateFilter = value => {
    if (!_isFinite(value)) {
      this.props.removeSearchFilters(['difficulty'])
    }
    else {
      this.props.setSearchFilters({difficulty: value})
    }
  }

  render() {
    const localizedDifficultyLabels = difficultyLabels(this.props.intl)
    const difficultyOptions =
      <ListDifficultyTypes 
        difficultyLabels={localizedDifficultyLabels}
        updateFilter={this.updateFilter}
      />

    if (this.props.asMenuList) {
      return (
        <React.Fragment>
          <h3 className="mr-text-yellow mr-text-sm mr-font-medium mr-uppercase mr--mx-4 mr-mt-4 mr-px-4">
            <FormattedMessage {...messages.difficultyLabel} />
          </h3>
          {difficultyOptions}
        </React.Fragment>
      )
    }
    else {
      return (
        <Dropdown
          className="mr-dropdown--flush xl:mr-border-l xl:mr-border-white-10 mr-p-6 mr-pl-0 xl:mr-pl-6"
          button={
            <ButtonFilter
              type={<FormattedMessage {...messages.difficultyLabel} />}
              selection={
                !_isFinite(this.props.searchFilters.difficulty) ?
                localizedDifficultyLabels.any :
                <FormattedMessage {...messagesByDifficulty[this.props.searchFilters.difficulty]} />
              }
            />
          }
        >
          {difficultyOptions}
        </Dropdown>
      )
    }
  }
}

const ListDifficultyTypes = props => {
  const menuItems = _map(ChallengeDifficulty, (difficulty, name) => (
    <li key={difficulty}>
      <Link to={{}} onClick={() => props.updateFilter(difficulty)}>
        {props.difficultyLabels[name]}
      </Link>
    </li>
  ))

  // Add 'Any' option to start of dropdown
  menuItems.unshift(
    <li key='any'>
      <Link to={{}} onClick={() => props.updateFilter(null)}>
        {props.difficultyLabels.any}
      </Link>
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
