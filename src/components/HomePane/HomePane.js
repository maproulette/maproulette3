import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './HomePane.scss'

/**
 * HomePane displays the home page content
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class HomePane extends Component {
  getStarted = () => this.props.history.push('/browse/challenges')

  render() {
    const version = `v${process.env.REACT_APP_VERSION_SEMVER}`
    return (
      <div className="home-pane full-screen-height no-subnav">
        <div className='home-pane__content'>
          <div className='columns is-centered is-mobile icon-columns'>
            <div className='column is-narrow'>
              <SvgSymbol viewBox='0 0 20 20' sym="home-icon" className="home-pane__icon"/>
            </div>
          </div>

          <div className='columns'>
            <div className='column is-centered is-mobile'>
              <h1 className='title is-2'>
                <FormattedMessage {...messages.header} />
              </h1>
            </div>
          </div>

          <div className='home-pane__intro'>
            <ul className='home-pane__feature-points'>
              <li>
                <FormattedMessage {...messages.filterTagIntro}/>
              </li>

              <li>
                <FormattedMessage {...messages.filterLocationIntro} />
              </li>

              <li>
                <FormattedMessage {...messages.filterDifficultyIntro} />
              </li>

              <li>
                <FormattedMessage {...messages.createChallenges} />
              </li>
            </ul>
          </div>

          <div className='columns is-centered is-mobile'>
            <div className='column is-narrow'>
              <button className='button is-primary is-outlined home-pane__view-challenges'
                      onClick={this.getStarted}>
                <FormattedMessage {...messages.subheader} />
              </button>
            </div>
          </div>

          <div className='home-pane__footer'>
            <p>
              MapRoulette <a target="_blank" rel="noopener noreferrer" href={
                `${process.env.REACT_APP_GIT_REPOSITORY_URL}/releases/tag/${version}`
              }>
                {version}
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }
}
