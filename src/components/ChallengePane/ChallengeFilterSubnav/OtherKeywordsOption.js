import React, { Component } from 'react'
import SearchBox from '../../SearchBox/SearchBox'

export default class OtherKeywordsOption extends Component {
  render() {
    return (
      <div className='navbar-item challenge_filter_subnav__other-keywords'>
        <label>Other:</label>
        <SearchBox suppressIcon showDoneButton {...this.props} />
      </div>
    )
  }
}
