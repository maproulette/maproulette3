import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { keys as _keys,
         isArray as _isArray,
         without as _without,
         first as _first } from 'lodash'
import { injectIntl } from 'react-intl'
import { ChallengeCategoryKeywords,
         keywordLabels }
       from '../../../services/Challenge/ChallengeKeywords/ChallengeKeywords'
import NavDropdown from '../../Bulma/NavDropdown'
import OtherKeywordsOption from './OtherKeywordsOption'
import messages from './Messages'

/**
 * FilterByKeyword displays a nav dropdown containing options for filtering
 * challenges by category keyword or a manually-entered keyword. The redux
 * store is updated to reflect the chosen category or keyword.
 *
 * @see See ChallengeCategoryKeywords
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class FilterByKeyword extends Component {
  /**
   * Update the challenge filter with the selected value
   *
   * @private
   */
  updateFilter = ({ value }) => {
    if (value === null) {
      this.props.removeChallengeFilters(['keywords'])
    }
    else {
      this.props.setKeywordFilter(_isArray(value) ? value : [ value ])
    }
  }

  setOtherKeywords = keywordString => {
    this.updateFilter({value: keywordString})
  }

  clearOtherKeywords = () => {
    this.updateFilter({value: null})
  }

  render() {
    const localizedKeywordLabels = keywordLabels(this.props.intl)

    const categories = _without(_keys(ChallengeCategoryKeywords), 'other')
    const activeCategory = _first(this.props.challengeFilter.keywords)
    const selectOptions = categories.map(keyword => ({
      key: keyword,
      text: localizedKeywordLabels[keyword],
      value: keyword,
    }))

    // Add 'Anything' option to start of dropdown
    const anyOption = {
      key: 'any',
      text: localizedKeywordLabels.any,
      value: null,
    }
    selectOptions.unshift(anyOption)

    // If the active category doesn't match a known category, then it's an
    // manually entered ("other") keyword
    const otherKeyword =
      categories.indexOf(activeCategory) === -1 ? activeCategory : null

    // Add 'other' box for manually entering other keywords not included in menu.
    selectOptions.push({
      Renderable: OtherKeywordsOption,
      ownProps: {
        searchQuery: {query: otherKeyword},
        setSearch: this.setOtherKeywords,
        clearSearch: this.clearOtherKeywords,
        placeholder: '',
      },
      key: 'other',
      text: localizedKeywordLabels.other,
      value: otherKeyword,
    })

    return (
      <NavDropdown placeholder={anyOption.text}
                   label={this.props.intl.formatMessage(messages.keywordLabel)}
                   options={selectOptions}
                   value={_first(this.props.challengeFilter.keywords)}
                   onChange={this.updateFilter}
      />
    )
  }
}

FilterByKeyword.propTypes = {
  /** Invoked to update the challenge keyword filter */
  setChallengeFilters: PropTypes.func.isRequired,
  /** Invoked to clear the challenge keyword filter */
  removeChallengeFilters: PropTypes.func.isRequired,
  /** The current value of the challenge filter */
  challengeFilter: PropTypes.object,
}

FilterByKeyword.defaultProps = {
  challengeFilter: {},
}

export default injectIntl(FilterByKeyword)
