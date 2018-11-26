import React, { Component } from 'react'
import SearchBox from '../../SearchBox/SearchBox'

export default class OtherKeywordsOption extends Component {
  render() {
    return (
      <form className="mr-flex mr-items-center">
        <label
          className="mr-text-green-lighter mr-mr-4 mr-cursor-pointer"
        >
          Other:
        </label>
        <SearchBox
          {...this.props}
          suppressIcon
          showDoneButton
          leftAligned
          className="mr-appearance-none mr-outline-none mr-rounded-none mr-bg-transparent mr-text-white mr-border-b mr-border-green-lighter"
        />
      </form>
    )
  }
}
