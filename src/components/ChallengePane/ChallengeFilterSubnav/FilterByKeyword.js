import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _keys from 'lodash/keys'
import _without from 'lodash/without'
import _isEmpty from 'lodash/isEmpty'
import _first from 'lodash/first'
import { injectIntl, FormattedMessage } from 'react-intl'
import { CHALLENGE_CATEGORY_OTHER,
         categoryMatchingKeywords,
         combinedCategoryKeywords,
         keywordLabels }
       from '../../../services/Challenge/ChallengeKeywords/ChallengeKeywords'
import OtherKeywordsOption from './OtherKeywordsOption'
import Dropdown from '../../Dropdown/Dropdown'
import ButtonFilter from './ButtonFilter'
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
  updateFilter = (value, closeDropdown) => {
    if (value === null) {
      this.props.removeSearchFilters(['keywords'])
    }
    else {
      this.props.setKeywordFilter(combinedCategoryKeywords[value])
    }
    closeDropdown()
  }

  setOtherKeywords = keywordString => {
    this.props.setKeywordFilter([keywordString])
  }

  clearOtherKeywords = closeDropdown => {
    this.updateFilter({value: null}, closeDropdown)
  }

  render() {
    const localizedKeywordLabels = keywordLabels(this.props.intl, true)
    const categories = _without(_keys(combinedCategoryKeywords), 'other')
    const activeCategory = categoryMatchingKeywords(this.props.searchFilters.keywords, true)

    // If the active category doesn't match a known category, then it's a
    // manually entered ("other") keyword
    const otherKeyword = activeCategory === CHALLENGE_CATEGORY_OTHER ?
                          _first(this.props.searchFilters.keywords) : null

    const notFiltering = _isEmpty(this.props.searchFilters.keywords)

    return (
      <Dropdown
        className="mr-dropdown--flush xl:mr-border-l xl:mr-border-white-10 mr-p-6 mr-pl-0 xl:mr-pl-6"
        dropdownButton={dropdown =>
          <ButtonFilter
            type={<FormattedMessage {...messages.keywordLabel} />}
            selection={
              notFiltering ?
              localizedKeywordLabels.any :
              localizedKeywordLabels[activeCategory]
            }
            onClick={dropdown.toggleDropdownVisible}
            selectionClassName={notFiltering ? null : 'mr-text-yellow'}
          />
        }
        dropdownContent={dropdown =>
          <ListFilterItems
            keywordLabels={localizedKeywordLabels}
            categories={categories}
            activeCategory={activeCategory}
            otherKeyword={otherKeyword}
            setOtherKeywords={this.setOtherKeywords}
            clearOtherKeywords={() => this.clearOtherKeywords(dropdown.closeDropdown)}
            updateFilter={this.updateFilter}
            closeDropdown={dropdown.closeDropdown}
          />
        }
      />
    )
  }
}

const ListFilterItems = function(props) {
  const menuItems = props.categories.map(keyword => (
    <li key={keyword}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a onClick={() => props.updateFilter(keyword, props.closeDropdown)}>
        {props.keywordLabels[keyword]}
      </a>
    </li>
  ))

  // Add 'Anything' option to start of dropdown
  menuItems.unshift(
    <li key='any'>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a onClick={() => props.updateFilter(null, props.closeDropdown)}>
        {props.keywordLabels.any}
      </a>
    </li>
  )

  // Add 'other' box for manually entering other keywords not included in menu.
  menuItems.push(
    <li key='other'>
      <OtherKeywordsOption
        searchQuery={{query: props.otherKeyword}}
        setSearch={props.setOtherKeywords}
        clearSearch={props.clearOtherKeywords}
        deactivate={props.closeDropdown}
        placeholder=''
      />
    </li>
  )

  return (
    <ol className="mr-list-dropdown mr-list-dropdown--ruled">
      {menuItems}
    </ol>
  )
}

FilterByKeyword.propTypes = {
  /** Invoked to update the challenge keyword filter */
  setKeywordFilter: PropTypes.func.isRequired,
  /** Invoked to clear the challenge keyword filter */
  removeSearchFilters: PropTypes.func.isRequired,
  /** The current value of the challenge filter */
  searchFilter: PropTypes.object,
}

FilterByKeyword.defaultProps = {
  searchFilters: {},
}

export default injectIntl(FilterByKeyword)
