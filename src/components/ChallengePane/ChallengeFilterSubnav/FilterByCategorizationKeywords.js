import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl, FormattedMessage } from 'react-intl'
import Dropdown from '../../Dropdown/Dropdown'
import ButtonFilter from './ButtonFilter'
import messages from './Messages'

/**
 * FilterByCategorizationKeywords displays a nav dropdown containing customizable options 
 * for filtering challenges by category keyword. The redux
 * store is updated to reflect the chosen keywords.
 *
 * @author [Collin Beczak](https://github.com/collinbeczak)
 */
class FilterByCategorizationKeywords extends Component {
  updateFilter = (value, categorizationFilters) => {
    const updatedFilters = new Set(categorizationFilters)

    if (value === null) {
      this.props.setCategorizationFilters([])
      return
    } else {
      if (updatedFilters.has(value)) {
        updatedFilters.delete(value)
      } else {
        updatedFilters.add(value)
      }
    }

    // Update redux store or perform other necessary actions
    this.props.setCategorizationFilters(Array.from(updatedFilters))
  }

  addKeyword = (value, categories) => {
    value = value.trim()
    const addKeyword = new Set(categories)

    if (value === "" || categories.length === 6) {
      return
    }

    addKeyword.add(value)

    // Update redux store or perform other necessary actions
    this.props.updateUserAppSetting(this.props.user.id, {
      'categorizationKeys': Array.from(addKeyword),
    })
  }

  removeKeyword = (value, categories, categorizationFilters) => {
    const removeKeyword = new Set(categories)
    const removeFilter =  new Set(categorizationFilters)
    
    removeKeyword.delete(value)

    if (removeFilter.has(value)) {
      removeFilter.delete(value)
      this.props.setCategorizationFilters(Array.from(removeFilter))
    }

    // Update redux store or perform other necessary actions
    this.props.updateUserAppSetting(this.props.user.id, {
      'categorizationKeys': Array.from(removeKeyword),
    })
  }

  render() {
    const categorizationFilters = this.props.searchFilters.categorizationKeywords ? this.props.searchFilters.categorizationKeywords : []
    const categories = this.props.user.properties.mr3Frontend.settings.categorizationKeys

    return (
      <Dropdown
        className="mr-dropdown--flush xl:mr-border-l xl:mr-border-white-10 mr-p-6 mr-pl-0 xl:mr-pl-6"
        dropdownButton={(dropdown) => (
          <ButtonFilter
            type={<FormattedMessage {...messages.categorizeLabel} />}
            selection={categorizationFilters.length > 0 ? `${categorizationFilters.length} Filters` : "Anything"}
            onClick={dropdown.toggleDropdownVisible}
            selectionClassName={categorizationFilters.length > 0 ? 'mr-text-yellow' : null}
          />
        )}
        dropdownContent={(dropdown) => (
          <ListFilterItems
            categorizationFilters={categorizationFilters}
            categories={categories}
            updateFilter={this.updateFilter}
            addKeyword={this.addKeyword}
            removeKeyword={this.removeKeyword}
            closeDropdown={dropdown.closeDropdown}
          />
        )}
      />
    )
  }
}

const ListFilterItems = function (props) {
  const { categorizationFilters, categories } = props

  const menuItems = categories.map((keyword) => (
    <li className="mr-flex" key={keyword}>
      <a
        className={`mr-flex-1 ${
          categorizationFilters.includes(keyword) ? 'mr-text-yellow' : ''
        }`}
        onClick={() => props.updateFilter(keyword, categorizationFilters)}
      >
        <div className={
          categorizationFilters.includes(keyword) ? 'mr-text-yellow' : ''}>{keyword}</div>
      </a>
      <button onClick={() => props.removeKeyword(keyword, categories, categorizationFilters)}>
        <svg viewBox="0 0 40 40" className="mr-fill-current mr-w-5 mr-h-5 mr-my-auto mr-mx-2">
          <use href="#close-outline-icon"></use>
        </svg>
      </button>
    </li>
  ))

  // Add 'Anything' option to start of dropdown
  menuItems.unshift(
    <li key="anything">
      <a onClick={() => props.updateFilter(null)}>Anything</a>
    </li>
  )

  // Add box for manually entering other keywords not included in the menu.
  menuItems.push(
    <li key="add">
      {props.categories.length === 0 ? (
        <div className="mr-text-grey-light mr-pt-2"> You have not set any categories.</div>
      ) : null}
      <div className="mr-flex mr-items-center mr-py-3">
        <label className="mr-text-green-lighter mr-mr-4 mr-cursor-pointer">Add:</label>
        <form onSubmit={(e) => {
          e.preventDefault() // Prevent the default form submission behavior
          const value = e.target.elements.inputName.value // Replace 'inputName' with the actual name attribute of the input
          props.addKeyword(value, categories)

          // Clear the input field
          e.target.elements.inputName.value = ''
        }}>
          <input
            className="mr-flex mr-items-center mr-border-none mr-text-white mr-rounded mr-bg-black-15 mr-shadow-inner mr-px-2"
            name="inputName"
          />
        </form>
      </div>
      <div className="mr-text-grey-light">
        {props.categories.length === 6
          ? <div><div>You must delete a category</div>to add a new one.</div>
          : "Add a new category"}
      </div>
    </li>
  )

  return <ol className="mr-list-dropdown mr-list-dropdown--ruled">{menuItems}</ol>
}

FilterByCategorizationKeywords.propTypes = {
  /** Invoked to update the challenge keyword filter */
  setCategorizationFilters: PropTypes.func.isRequired,
}

export default injectIntl(FilterByCategorizationKeywords)
