import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _first from 'lodash/first'
import _keys from 'lodash/keys'
import _values from 'lodash/values'

export default class Tabs extends Component {
  state = {
    activeTab: null,
  }

  render() {
    if (_isEmpty(this.props.tabs)) {
      return null
    }

    const tabNames = _keys(this.props.tabs)
    const tabLabels = _map(tabNames, name => (
      <li key={name}
          className={classNames({
            "is-active": this.state.activeTab ?
                        name === this.state.activeTab :
                        name === _first(tabNames)})}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a onClick={() => this.setState({activeTab: name})}>{name}</a>
      </li>
    ))

    const activeTabContent = this.state.activeTab ?
                             this.props.tabs[this.state.activeTab] :
                             _values(this.props.tabs)[0]

    return [
      <div key="tab-labels"
           className={classNames('tabs', this.props.className)}>
        <ul>
          {tabLabels}
        </ul>
      </div>,
      <div key="tab-content" className="tab-content">
        {activeTabContent}
      </div>
    ]
  }
}

Tabs.propTypes = {
  /** Each key should be a tab name and value the tab content */
  tabs: PropTypes.object.isRequired,
}
