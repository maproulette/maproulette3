import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _map from 'lodash/map'
import { injectIntl } from 'react-intl'
import NavDropdown from '../../Bulma/NavDropdown'
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
      this.props.removeChallengeFilters(['difficulty'])
    }
    else {
      this.props.setChallengeFilters({difficulty: value})
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
      value: null,
    }
    selectOptions.unshift(anyOption)

    return (
      <NavDropdown placeholder={anyOption.text}
                   label={this.props.intl.formatMessage(messages.difficultyLabel)}
                   options={selectOptions}
                   value={this.props.challengeFilter.difficulty}
                   onChange={this.updateFilter}
      />
    )
  }
}

FilterByDifficulty.propTypes = {
  /** Invoked to update the challenge difficulty filter */
  setChallengeFilters: PropTypes.func.isRequired,
  /** Invoked to clear the challenge difficulty filter */
  removeChallengeFilters: PropTypes.func.isRequired,
  /** The current value of the challenge filter */
  challengeFilter: PropTypes.object,
}

FilterByDifficulty.defaultProps = {
  challengeFilter: {},
}

export default injectIntl(FilterByDifficulty)
