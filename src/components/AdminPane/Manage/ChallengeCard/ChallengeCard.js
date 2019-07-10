import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import AsManageableChallenge
       from '../../../../interactions/Challenge/AsManageableChallenge'
import ChallengeProgressBorder
       from '../ChallengeProgressBorder/ChallengeProgressBorder'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'

/**
 * ChallengeCard renders a single challenge item. Right now only list view is
 * supported (making 'card' a bit of a misnomer), but future support for a card
 * view is planned.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ChallengeCard extends Component {
  nameRef = React.createRef()

  render() {
    if (this.props.challenge.deleted) {
      return null
    }

    const challengeIcon =
      AsManageableChallenge(this.props.challenge).isComplete() ?
      "check-circled-icon" :
      (this.props.challenge.enabled ? 'visible-icon' : 'hidden-icon')

    return (
      <div className='item-entry' key={this.props.challenge.id}>
        <div className='columns challenge-list-item mr-items-center'>
          <div className='column is-narrow mr-mr-2'>
            <SvgSymbol
              className="mr-fill-grey-light mr-h-6 mr-align-middle"
              viewBox='0 0 20 20'
              sym={challengeIcon}
            />
          </div>

          <div ref={this.nameRef} className='column challenge-name mr-border-grey-lighter mr-border-b-2 mr-relative mr-pl-0'>
            <Link to={this.props.link}>
              {this.props.challenge.name}
            </Link>
            {this.props.showProjectName &&
              <div className='mr-text-xs mr-text-grey-light'>
                {_get(this.props.challenge, 'parent.displayName')}
              </div>
            }
            <ChallengeProgressBorder
              {...this.props}
              dimensions={
                this.nameRef.current ? this.nameRef.current.getBoundingClientRect() : undefined
              }
            />
          </div>

          <div className='column is-narrow item-pinned mr-ml-2'>
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
