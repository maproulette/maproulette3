import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import classNames from 'classnames'
import Popout from '../Bulma/Popout'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import WithDeactivateOnOutsideClick from
       '../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import messages from './Messages'
import './HelpPopout.scss'

const DeactivatablePopout = WithDeactivateOnOutsideClick(Popout)

/**
 * Convenience component for creating help-tip popouts activated by hover
 * over a help icon. The given children (and optional heading) are displayed in the
 * popout when activated. The popout defaults to appearing on the right of the
 * help icon, but that can be overriden with the `direction` prop.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class HelpPopout extends Component {
  render() {
    const helpButton = (
      <button className="button is-clear help-popout--control">
        <span className="icon"
              title={this.props.intl.formatMessage(messages.help)}>
          <SvgSymbol viewBox='0 0 20 20' sym="question-icon" />
        </span>
      </button>
    )

    return (
      <DeactivatablePopout direction='right'
                           className={classNames('help-popout', this.props.className)}
                           control={helpButton}>
        <div className="help-popout--content">
          {this.props.children}
        </div>
      </DeactivatablePopout>
    )
  }
}

HelpPopout.propTypes = {
  /** The help content. */

  /** Side on which popout should appear. Defaults to 'right' */
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
}

HelpPopout.defaultProps = {
  direction: 'right',
}

export default injectIntl(HelpPopout)
