import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _map from 'lodash/map'
import { injectIntl } from 'react-intl'
import NavDropdown from '../../Bulma/NavDropdown'
import MenuList from '../../Bulma/MenuList'
import { ChallengeDifficulty,
         difficultyLabels }
       from '../../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty'
import messages from './Messages'

/**
 * FilterByDifficulty displays a nav dropdown containing options for filtering
 * challenges by difficulty or suggested experience. The challenge filter in
 * the redux store is updated to reflect the selected difficulty option.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class FilterByDifficulty extends Component {
  /**
   * Update the challenge filter with the selected value.
   *
   * @private
   */
  updateFilter = ({ value }) => {
    if (value === null) {
      this.props.removeSearchFilters(['difficulty'])
    }
    else {
      this.props.setSearchFilters({difficulty: value})
    }
  }

  render() {
    const localizedDifficultyLabels = difficultyLabels(this.props.intl)

    const selectOptions = _map(ChallengeDifficulty, (difficulty, name) => ({
      key: difficulty,
      text: localizedDifficultyLabels[name],
      value: difficulty,
    }))

    // Add 'Any' option to start of dropdown
    const anyOption = {
      key: 'any',
      text: localizedDifficultyLabels.any,
      value: undefined,
    }
    selectOptions.unshift(anyOption)

    const Selection = this.props.asMenuList ? MenuList : NavDropdown
    return (
      <Selection placeholder={anyOption.text}
                 label={this.props.intl.formatMessage(messages.difficultyLabel)}
                 options={selectOptions}
                 value={this.props.searchFilters.difficulty}
                 onChange={this.updateFilter}
      />
    )
  }
}

FilterByDifficulty.propTypes = {
  /** Invoked to update the challenge difficulty filter */
  setSearchFilters: PropTypes.func.isRequired,
  /** Invoked to clear the challenge difficulty filter */
  removeSearchFilters: PropTypes.func.isRequired,
  /** The current value of the challenge filter */
  searchFilters: PropTypes.object,
  /** Set to true to render a MenuList instead of NavDropdown */
  asMenuList: PropTypes.bool,
}

FilterByDifficulty.defaultProps = {
  searchFilters: {},
  asMenuList: false,
}

export default injectIntl(FilterByDifficulty)
