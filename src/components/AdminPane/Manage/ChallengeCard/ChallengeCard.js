import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import AsManageableChallenge
       from '../../../../interactions/Challenge/AsManageableChallenge'
import WithChallengeManagement
       from '../../HOCs/WithChallengeManagement/WithChallengeManagement'
import ChallengeProgressBorder
       from '../ChallengeProgressBorder/ChallengeProgressBorder'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

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

    const ChallengeIcon = AsManageableChallenge(this.props.challenge).isComplete() ?
                          CompleteIcon : VisibilityIcon

    return (
      <div className='item-entry mr-pt-4' key={this.props.challenge.id}>
        <div className='columns challenge-list-item mr-items-center'>
          <div className='column is-narrow mr-mr-2'>
            <ChallengeIcon {...this.props} />
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

            {_isFinite(_get(this.props.challenge, 'actions.total')) &&
             <div className="mr-absolute mr-pin-b mr-pin-r mr-z-50 mr-text-grey-light mr-text-xxs">
               {this.props.challenge.actions.total} <FormattedMessage {...messages.totalTasks} />
             </div>
            }
          </div>

          <div className='column is-narrow mr-pl-8 mr-relative mr-flex mr-justify-between'>
            <div className="item-pinned">
              <div className="clickable"
                  onClick={() => this.props.toggleChallengePin(this.props.challenge.id)}>
                <SvgSymbol className={classNames('icon', {enabled: this.props.isPinned})}
                            viewBox='0 0 20 20'
                            sym='pin-icon' />
              </div>
            </div>

            {!this.props.hideTallyControl &&
              <div className='item-tallied mr-ml-4'>
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
      </div>
    )
  }
}

const CompleteIcon = function(props) {
  return (
    <SvgSymbol
      className="mr-fill-grey-light mr-h-6 mr-align-middle"
      viewBox='0 0 20 20'
      sym="check-circled-icon"
    />
  )
}

const VisibilityIcon = WithChallengeManagement(injectIntl(function(props) {
  const isVisible = props.challenge.enabled
  return (
    <span
      className={classNames(
        "mr-text-grey-light mr-transition",
        isVisible ? "hover:mr-text-green-light" : "hover:mr-text-green-light-60"
      )}
    >
      <SvgSymbol
        className="mr-fill-current mr-h-6 mr-align-middle mr-cursor-pointer"
        viewBox='0 0 20 20'
        sym={isVisible ? 'visible-icon' : 'hidden-icon'}
        onClick={() => props.updateEnabled(props.challenge.id, !isVisible)}
        title={props.intl.formatMessage(messages.visibilityToogleTooltip)}
      />
    </span>
  )
}))

ChallengeCard.propTypes = {
  challenge: PropTypes.object.isRequired,
  isPinned: PropTypes.bool,
}
