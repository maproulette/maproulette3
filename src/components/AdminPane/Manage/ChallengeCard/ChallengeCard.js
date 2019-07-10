import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'

/**
 * ChallengeCard renders a single challenge item. Right now only list view is
 * supported (making 'card' a bit of a misnomer), but future support for a card
 * view is planned.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ChallengeCard extends Component {
  render() {
    if (this.props.challenge.deleted) {
      return null
    }

    return (
      <div className='item-entry' key={this.props.challenge.id}>
        <div className='columns challenge-list-item'>
          <div className='column is-narrow item-visibility'>
            <SvgSymbol className={classNames('icon', {enabled: this.props.challenge.enabled})}
                        viewBox='0 0 20 20'
                        sym={this.props.challenge.enabled ? 'visible-icon' : 'hidden-icon'} />
          </div>

          <div className='column challenge-name'>
            <Link to={this.props.link}>
              {this.props.challenge.name}
            </Link>
            {this.props.showProjectName &&
              <div className='mr-text-xs mr-text-grey-light'>
                {_get(this.props.challenge, 'parent.displayName')}
              </div>
            }
          </div>

          <div className='column is-narrow item-pinned'>
            <div className="clickable"
                 onClick={() => this.props.toggleChallengePin(this.props.challenge.id)}>
              <SvgSymbol className={classNames('icon', {enabled: this.props.isPinned})}
                          viewBox='0 0 20 20'
                          sym='pin-icon' />
            </div>
          </div>

          {!this.props.hideTallyControl &&
            <div className='column is-narrow item-tallied'>
              <div className="clickable"
                   onClick={() => this.props.toggleChallengeTally(this.props.project.id, this.props.challenge.id)}>
                <SvgSymbol className={classNames('icon', {enabled: this.props.isTallied})}
                            viewBox='0 0 20 20'
                            sym='chart-icon' />
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

ChallengeCard.propTypes = {
  challenge: PropTypes.object.isRequired,
  isPinned: PropTypes.bool,
}
