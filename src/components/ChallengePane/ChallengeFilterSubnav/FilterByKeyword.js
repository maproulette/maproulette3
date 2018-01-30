import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _keys from 'lodash/keys'
import _without from 'lodash/without'
import _isEmpty from 'lodash/isEmpty'
import _first from 'lodash/first'
import { injectIntl } from 'react-intl'
import { CHALLENGE_CATEGORY_OTHER,
         ChallengeCategoryKeywords,
         categoryMatchingKeywords,
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
      this.props.setKeywordFilter(ChallengeCategoryKeywords[value])
    }
  }

  setOtherKeywords = keywordString => {
    this.props.setKeywordFilter([keywordString])
  }

  clearOtherKeywords = () => {
    this.updateFilter({value: null})
  }

  render() {
    const localizedKeywordLabels = keywordLabels(this.props.intl)

    const categories = _without(_keys(ChallengeCategoryKeywords), 'other')
    const activeCategory = categoryMatchingKeywords(this.props.challengeFilter.keywords)
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

    // If the active category doesn't match a known category, then it's a
    // manually entered ("other") keyword
    const otherKeyword = activeCategory === CHALLENGE_CATEGORY_OTHER ?
                         _first(this.props.challengeFilter.keywords) : null

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
                   value={_isEmpty(this.props.challengeFilter.keywords) ?
                          null : {text: localizedKeywordLabels[activeCategory]}}
                   onChange={this.updateFilter}
      />
    )
  }
}

FilterByKeyword.propTypes = {
  /** Invoked to update the challenge keyword filter */
  setKeywordFilter: PropTypes.func.isRequired,
  /** Invoked to clear the challenge keyword filter */
  removeChallengeFilters: PropTypes.func.isRequired,
  /** The current value of the challenge filter */
  challengeFilter: PropTypes.object,
}

FilterByKeyword.defaultProps = {
  challengeFilter: {},
}

export default injectIntl(FilterByKeyword)
