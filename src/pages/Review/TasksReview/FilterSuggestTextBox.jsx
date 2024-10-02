import { Component } from 'react'
import classNames from 'classnames'
import _filter from 'lodash/filter'
import _toLower from 'lodash/toLower'
import _find from 'lodash/find'
import _isEmpty from 'lodash/isEmpty'
import _isObject from 'lodash/isObject'
import AutosuggestTextBox from '../../../components/AutosuggestTextBox/AutosuggestTextBox'

export const FILTER_SEARCH_TEXT = -1
export const FILTER_SEARCH_ALL = -2

/**
 * FilterSuggestTextBox wraps the AutosuggestTextBox to filter results.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class FilterSuggestTextBox extends Component {
  state = {
    searchQuery: null,
  }

  searchResults = () => {
    const filteredList = _filter(this.props.itemList,
      item => _toLower(item.name).includes(_toLower(this.state.searchQuery)))

    if (this.state.searchQuery &&
       !_find(filteredList, item => _toLower(item.name) === _toLower(this.state.searchQuery))) {
      filteredList.splice(0, 0, {id: FILTER_SEARCH_TEXT, name: this.state.searchQuery})
    }

    if (_isEmpty(this.state.searchQuery)) {
      filteredList.splice(0, 0, {id: FILTER_SEARCH_ALL, name: this.props.filterAllLabel})
    }

    return filteredList
  }

  render() {
    const inputValue = this.state.searchQuery === null ?
      _isObject(this.props.value) ? this.props.value.name : this.props.value :
      this.state.searchQuery

    return (
      <AutosuggestTextBox
        inputClassName={classNames(
          "mr-py-2 mr-px-4 mr-border-none mr-placeholder-white-50 ",
          "mr-text-white mr-rounded mr-bg-black-15 mr-shadow-inner",
          this.props.className)}
        onChange={item => item ? this.props.onChange(item) : null}
        search={searchQuery => this.setState({searchQuery})}
        searchResults={this.searchResults()}
        resultLabel={item => item.name}
        resultKey={item => item.id}
        inputValue={inputValue || ""}
        resultClassName={(result) =>
          (result.id < 0 ? "mr-border-solid mr-border-b mr-border-grey mr-pb-2" : "")}
        allowNew={true}
        fixedMenu
        openOnFocus
        multiselect={this.props.multiselect}
      />
    )
  }
}
