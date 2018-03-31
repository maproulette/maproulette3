import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Sprites from '../Sprites/Sprites'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './MobileNotSupported.css'

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
              <FormattedMessage {...messages.message} />
            </p>
          </div>
        </div>
        <Sprites />
      </div>
    )
  }
}
