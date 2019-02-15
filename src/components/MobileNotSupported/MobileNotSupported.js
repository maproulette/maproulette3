import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import Sprites from '../Sprites/Sprites'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './MobileNotSupported.scss'

/**
 * MobileNotSupported displays a message indicating that mobile devices are not
 * supported and the user should visit on their computer. If forPage is given,
 * then the message is page-specific.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class MobileNotSupported extends Component {
  render() {
    return (
      <div className="mobile-not-supported">
        <div className="mobile-not-supported__header">
          <SvgSymbol viewBox='0 0 20 20' sym="computer-icon" />
          <div>
            <h1 className="title">
              <FormattedMessage {...messages.header} />
            </h1>
            <p className="mobile-not-supported__message">
              <FormattedMessage {...(this.props.forPage ?
                                     messages.pageMessage :
                                     messages.message)} />
            </p>
            {this.props.widenDisplay &&
             <p className="mobile-not-supported__widen-display">
               <FormattedMessage {...messages.widenDisplay} />
             </p>
            }
          </div>
        </div>
        <Sprites />
      </div>
    )
  }
}

MobileNotSupported.propTypes = {
  /** Set to true if a single page is unsupported */
  forPage: PropTypes.bool,
  /** Set to true to include note about widening display */
  widenDisplay: PropTypes.bool,
}

MobileNotSupported.defaultProps = {
  forPage: false,
  widenDisplay: false,
}
