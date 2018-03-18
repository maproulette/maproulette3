import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'
import _isObject from 'lodash/isObject'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import Delayed from 'react-delayed'
import Sidebar from '../../Sidebar/Sidebar'
import Popout from '../../Bulma/Popout'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import WithKeyboardShortcuts from '../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import MarkdownContent from '../../MarkdownContent/MarkdownContent'
import TaskStatusIndicator from './TaskStatusIndicator/TaskStatusIndicator'
import ActiveTaskControls from './ActiveTaskControls/ActiveTaskControls'
import ReviewTaskControls from './ReviewTaskControls/ReviewTaskControls'
import KeyboardShortcutReference from './KeyboardShortcutReference/KeyboardShortcutReference'
import TaskLocationMap from './TaskLocationMap/TaskLocationMap'
import CommentList from '../../CommentList/CommentList'
import CommentCountBadge from '../../CommentList/CommentCountBadge/CommentCountBadge'
import PlaceDescription from '../PlaceDescription/PlaceDescription'
import ChallengeShareControls from '../ChallengeShareControls/ChallengeShareControls'
import WithDeactivateOnOutsideClick from
       '../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import BusySpinner from '../../BusySpinner/BusySpinner'
import messages from './Messages'
import './ActiveTaskDetails.css'

const SIDEBAR_TRANSITION_DELAY = 500 // milliseconds

const DeactivatablePopout = WithDeactivateOnOutsideClick(Popout)
const KeyboardReferencePopout =
  WithKeyboardShortcuts(WithDeactivateOnOutsideClick(KeyboardShortcutReference))

/**
 * ActiveTaskDetails wraps, within a Sidebar, all of the relevant details about
 * the current task being worked upon that an end user needs to understand,
 * evaluate, and complete the task (description, instructions, comments,
 * completion controls, etc). The Sidebar can be minimized to reduce its
 * footprint (and maximize the visible map) while still offering basic controls
 * for task completion. Once minimized, the sidebar stays minimized for all
 * tasks within the same challenge unless the user chooses to maximize it again.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ActiveTaskDetails extends Component {
  state = {
    contactOwnerUrl: null,
  }

  /**
   * Invoked to toggle minimization of the sidebar
   */
  toggleIsMinimized = () => {
    const isVirtual = _isFinite(this.props.virtualChallengeId)
    const challengeId = isVirtual ? this.props.virtualChallengeId :
                                    _get(this.props.task, 'parent.id')
    if (_isFinite(challengeId)) {
      this.props.setChallengeMinimization(challengeId,
                                          isVirtual,
                                          !this.props.minimizeChallenge)
    }
  }

  /**
   * Invoked to toggle minimization of the challenge instructions.
   */
  toggleInstructionsCollapsed = () => {
    const isVirtual = _isFinite(this.props.virtualChallengeId)
    const challengeId = isVirtual ? this.props.virtualChallengeId :
                                    _get(this.props.task, 'parent.id')
    if (_isFinite(challengeId)) {
      this.props.setInstructionsCollapsed(challengeId,
                                          isVirtual,
                                          !this.props.collapseInstructions)
    }
  }

  updateContactOwnerUrl = props => {
    const ownerOSMId = _get(props, 'task.parent.owner')
    if (_isFinite(ownerOSMId) && ownerOSMId > 0) {
      props.contactTaskOwnerURL(ownerOSMId).then(url =>
        this.setState({contactOwnerUrl: url})
      )
    }
    else {
      this.setState({contactOwnerUrl: null})
    }
  }

  componentDidMount() {
    this.updateContactOwnerUrl(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (_get(nextProps, 'task.parent.owner') !==
        _get(this.props, 'task.parent.owner')) {
      this.updateContactOwnerUrl(nextProps)
    }
  }

  render() {
    if (!this.props.task) {
      return null
    }

    if (!_isObject(this.props.task.parent)) {
      return <BusySpinner />
    }

    const isEditingTask = _get(this, 'props.editor.taskId') === this.props.task.id &&
                          _get(this, 'props.editor.success') === true

    // Don't let sidebar be minimized if there is no current user or if the
    // task is being edited, as the controls in both cases need the extra
    // real-estate.
    const canBeMinimized = this.props.user && !isEditingTask && !this.props.reviewTask
    const isMinimized = canBeMinimized && this.props.minimizeChallenge

    const minimizerButton =
      !canBeMinimized ? null :
      <button className="toggle-minimization" onClick={this.toggleIsMinimized} />

    const challengeNameLink =
      <Link to={`/browse/challenges/${_get(this.props.task, 'parent.id', '')}`}>
        {_get(this.props.task, 'parent.name')}
      </Link>

    const taskInstructions = !_isEmpty(this.props.task.instruction) ?
                             this.props.task.instruction :
                             _get(this.props.task, 'parent.instruction')

    const taskControls = this.props.reviewTask ?
      <ReviewTaskControls className="active-task-details__controls"
                          {...this.props} /> :
      <ActiveTaskControls className="active-task-details__controls"
                          isMinimized={isMinimized}
                          {...this.props} />

    let infoPopout = null
    let commentPopout = null
    if (isMinimized) {
      const infoPopoutButton = (
        <button className="button icon-only active-task-details__info-control">
          <span className="control-icon"
                title={this.props.intl.formatMessage(messages.info)}>
            <SvgSymbol viewBox='0 0 20 20' sym="info-icon" />
          </span>
        </button>
      )

      infoPopout = (
        <DeactivatablePopout direction='right'
                             className='active-task-details__info-popout'
                             control={infoPopoutButton}>
          <div className="popout-content__header active-task-details--bordered">
            <h3 className="info-popout--name">{challengeNameLink}</h3>

            <div className="info-popout--project-name">
              {_get(this.props.task, 'parent.parent.displayName')}
            </div>

            {this.state.contactOwnerUrl &&
            <a className="active-task-details__contact-owner"
                href={this.state.contactOwnerUrl}
                target='_blank'>
              <SvgSymbol viewBox='0 0 20 20' sym="envelope-icon" />
              <FormattedMessage {...messages.contactOwnerLabel} />
            </a>
            }
          </div>

          <div className="popout-content__body">
            <div className='info-popout--instructions'>
              <MarkdownContent markdown={taskInstructions} />
            </div>
          </div>
        </DeactivatablePopout>
      )

      const commentBadge =
        <CommentCountBadge
          className="active-task-details--comment-badge active-task-details--bordered"
          tooltip={this.props.intl.formatMessage(messages.viewComments)}
          comments={_get(this.props, 'task.comments')} />

      commentPopout = (
        <DeactivatablePopout direction='right'
                             className='active-task-details__comment-popout'
                             control={commentBadge}>

          <div className="popout-content__header active-task-details--bordered">
            <h3>
              <FormattedMessage {...messages.comments} />
            </h3>
          </div>

          <div className="popout-content__body">
            <CommentList comments={this.props.task.comments} />
          </div>
        </DeactivatablePopout>
      )
    }

    return (
      <Sidebar className={classNames('active-task-details',
                                     {'is-minimized': isMinimized})}
               isActive={true}>
        <div className="sidebar--minimizer">
          {minimizerButton}
        </div>

        <div className="active-task-details__task-content"
             key={`task-content-${this.props.task.id}-${_get(this.props.task, '_metaFetchedAt')}`}>
          <div className="task-content__task-header active-task-details--bordered">
            <div className="active-task-details--heading primary-heading">
              <FormattedMessage {...messages.challengeHeading} />
            </div>

            <h2 className="active-task-details--name">{challengeNameLink}</h2>

            <div className="active-task-details--project-name">
              {_get(this.props.task, 'parent.parent.displayName')}
            </div>

            {this.state.contactOwnerUrl &&
            <a className="active-task-details__contact-owner"
                href={this.state.contactOwnerUrl}
                target='_blank'>
              <SvgSymbol viewBox='0 0 20 20' sym="envelope-icon" />
              <FormattedMessage {...messages.contactOwnerLabel} />
            </a>
            }
          </div>

          <div className="task-content__task-body">
            {isMinimized && infoPopout}
            {isMinimized && commentPopout}

            {!isMinimized &&
              <div>
                {!_isEmpty(taskInstructions) &&
                  <div className={classNames('active-task-details--instructions',
                    {'active-task-details--bordered': !isMinimized,
                     'is-expanded': !this.props.collapseInstructions})}>
                     <div className="active-task-details--sub-heading collapsible"
                          onClick={this.toggleInstructionsCollapsed} >
                      <FormattedMessage {...messages.instructions} />

                      <a className="collapsible-icon" aria-label="more options">
                        <span className="icon"></span>
                      </a>
                    </div>
                    {!this.props.collapseInstructions &&
                     <MarkdownContent markdown={taskInstructions} />
                    }
                  </div>
                }
                {_isUndefined(taskInstructions) && <BusySpinner />}
              </div>
            }

            <TaskStatusIndicator allStatuses={this.props.reviewTask}
                                 isMinimized={isMinimized}
                                 {...this.props} />
            {taskControls}
            <KeyboardReferencePopout isMinimized={isMinimized}
                                    className='active-task-details--bordered'
                                    {...this.props} />

            {!isMinimized &&
              <Delayed mounted={true} mountAfter={SIDEBAR_TRANSITION_DELAY}>
                <div>
                  <div className="active-task-details--inset-map">
                      <div className="active-task-details--sub-heading">
                        <FormattedMessage {...messages.location} />
                      </div>
                    <TaskLocationMap key={this.props.task.id} {...this.props} />
                  </div>

                  <PlaceDescription place={this.props.task.place}
                                    className="active-task-details--place active-task-details--bordered"/>
                </div>
              </Delayed>
            }

            {process.env.REACT_APP_FEATURE_SOCIAL_SHARING !== 'disabled' &&
            <div>
              <div className="active-task-details--sub-heading">
                <FormattedMessage {...messages.social} />
              </div>
              <ChallengeShareControls className={classNames('active-task-details__share-controls',
                                                            {'active-task-details--bordered': !isMinimized,
                                                            'is-minimized': isMinimized})}
                                      challenge={this.props.task.parent} />
            </div>
            }

            <div className="active-task-details__task-comments">
              <div className="active-task-details--sub-heading">
                <FormattedMessage {...messages.comments} />
                <CommentCountBadge comments={_get(this.props, 'task.comments')} />
              </div>

              <CommentList comments={this.props.task.comments} />
            </div>
          </div>
        </div>
      </Sidebar>
    )
  }
}

ActiveTaskDetails.propTypes = {
  /** The task to display details about */
  task: PropTypes.object,
  /** Set to true to minimize the sidebar, false to expand */
  minimizeChallenge: PropTypes.bool,
  /** Invoked when the user toggles minimization of the sidebar */
  setChallengeMinimization: PropTypes.func.isRequired,
}

ActiveTaskDetails.defaultProps = {
  minimizeChallenge: false,
  reviewTask: false,
}

export default injectIntl(ActiveTaskDetails)
