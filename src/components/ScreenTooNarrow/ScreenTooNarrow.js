import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Sprites from '../Sprites/Sprites'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './ScreenTooNarrow.scss'

/**
 * ScreenTooNarrow displays a message indicating that the user's screen/window
 * is too narrow to display the current page
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ScreenTooNarrow extends Component {
  render() {
    return (
      <div className="screen-too-narrow">
        <div className="screen-too-narrow__header">
          <SvgSymbol viewBox='0 0 20 20' sym="computer-icon" />
          <div>
            <h1 className="title"><FormattedMessage {...messages.header} /></h1>
            <p className="screen-too-narrow__message">
              <FormattedMessage {...messages.message} />
            </p>
          </div>
        </div>
        <Sprites />
      </div>
    )
  }
}
