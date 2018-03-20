import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _isFunction from 'lodash/isFunction'
import _isBoolean from 'lodash/isBoolean'
import './CollapsibleSection.css'

/**
 * CollapsibleSection renders content that can be collapsed/minimized.
 * The heading, if given, is always displayed. By default, each component
 * will manage its own expanded/collapsed state, but it can be managed
 * by passing isExpanded and toggle props.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class CollapsibleSection extends Component {
  state = {
    isExpanded: !this.props.collapsedByDefault
  }

  toggle = () => {
    _isFunction(this.props.toggle) ?
      this.props.toggle() :
      this.setState({isExpanded: !this.state.isExpanded})
  }

  isExpanded = () =>
    _isBoolean(this.props.isExpanded) ?
      this.props.isExpanded :
      this.state.isExpanded

  render() {
    const expanded = this.isExpanded()

    return (
      <div className={classNames('collapsible-section',
                                 this.props.className,
                                 {'is-expanded': expanded, 'is-collapsed': !expanded})}>
        <div className="collapsible-section__heading collapsible"
             onClick={this.toggle} >
          {this.props.heading}

          {!this.props.hideIndicator &&
           <a className="collapsible-icon" aria-label="more options">
             <span className="icon"></span>
           </a>
          }
        </div>

        {expanded && this.props.children}
      </div>
    )
  }
}

CollapsibleSection.propTypes = {
  isExpanded: PropTypes.bool,
  toggle: PropTypes.func,
  collapsedByDefault: PropTypes.bool,
  hideIndicator: PropTypes.bool,
}

CollapsibleSection.defaultProps = {
  collapsedByDefault: false,
  hideIndicator: false,
}
