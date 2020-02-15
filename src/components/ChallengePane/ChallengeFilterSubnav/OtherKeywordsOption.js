import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import SearchBox from '../../SearchBox/SearchBox'
import messages from './Messages'

export default class OtherKeywordsOption extends Component {
  render() {
    return (
      <div className="mr-flex mr-items-center mr-py-3">
        <label
          className="mr-text-green-lighter mr-mr-4 mr-cursor-pointer"
        >
          <FormattedMessage {...messages.otherOption} />
        </label>
        <SearchBox
          {...this.props}
          suppressIcon
          showDoneButton
          leftAligned
          short
          buttonClassName="mr-fill-green-lighter"
        />
      </div>
    )
  }
}
