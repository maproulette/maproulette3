import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import WithDeactivateOnOutsideClick from
       '../../../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import CollapsibleSection from '../../../../CollapsibleSection/CollapsibleSection'
import Popout from '../../../../Bulma/Popout'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

// Setup child components with needed HOCs.
const DeactivatablePopout = WithDeactivateOnOutsideClick(Popout)

/**
 * MoreOptionsControl displays additional, advanced, and niche
 * controls/settings when expanded.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class MoreOptionsControl extends Component {
  render() {
    // In minimized mode, show icon-only control with popout.
    if (this.props.isMinimized) {
      const iconControl = (
        <button className="button icon-only"
                title={this.props.intl.formatMessage(messages.moreOptionsLabel)}>
          <span className="control-icon">
            <SvgSymbol viewBox='0 0 20 20' sym="navigation-more-icon" />
          </span>
        </button>
      )

      return (
        <DeactivatablePopout direction='right'
                             className={this.props.className}
                             control={iconControl}>
          <div className="popout-content__header active-task-details--bordered">
            <h3><FormattedMessage {...messages.moreOptionsLabel} /></h3>
          </div>

          <div className="popout-content__body">
            {this.props.children}
          </div>
        </DeactivatablePopout>
      )
    }
    else {
      return (
        <CollapsibleSection collapsedByDefault hideIndicator
          className={this.props.className}
          isExpanded={!this.props.collapseMoreOptions}
          toggle={this.props.toggleMoreOptionsCollapsed}
          heading={
            <div className="has-svg-icon"> 
              <SvgSymbol viewBox='0 0 20 20' sym="navigation-more-icon" />
              <FormattedMessage {...messages.moreOptionsLabel} />
            </div>
          }
        >
          <div className="more-options-control__body">
            {this.props.children}
          </div>
        </CollapsibleSection>
      )
    }
  }
}
