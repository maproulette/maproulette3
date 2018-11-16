import React, { Component } from 'react'
import AboutModal from './AboutModal/AboutModal'

/**
 * AboutPane displays the AboutModal on top of the challenge search map in the
 * background (for visual appeal).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class AboutPane extends Component {
  render() {
    return (
      <div className="about-pane">
        <AboutModal {...this.props} />
      </div>
    )
  }
}
