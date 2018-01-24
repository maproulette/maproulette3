import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { startCase as _startCase,
         get as _get,
         isNumber as _isNumber,
         isEmpty as _isEmpty } from 'lodash'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import Delayed from 'react-delayed'
import Sidebar from '../../Sidebar/Sidebar'
import Popout from '../../Bulma/Popout'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import WithTaskCenterPoint from '../../HOCs/WithTaskCenterPoint/WithTaskCenterPoint'
import WithKeyboardShortcuts from '../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import MarkdownContent from '../../MarkdownContent/MarkdownContent'
import ActiveTaskControls from './ActiveTaskControls/ActiveTaskControls'
import TaskSaveControls from './ActiveTaskControls/TaskSaveControls/TaskSaveControls'
import KeyboardShortcutReference from './KeyboardShortcutReference/KeyboardShortcutReference'
import InsetMap from './InsetMap/InsetMap'
import CommentList from '../../CommentList/CommentList'
import CommentCountBadge from '../../CommentList/CommentCountBadge/CommentCountBadge'
import PlaceDescription from '../PlaceDescription/PlaceDescription'
import ChallengeShareControls from '../ChallengeShareControls/ChallengeShareControls'
import WithDeactivateOnOutsideClick from
       '../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import messages from './Messages'
import './ActiveTaskDetails.css'

const SIDEBAR_TRANSITION_DELAY = 500 // milliseconds

const OverviewMap = WithTaskCenterPoint(InsetMap)
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
  toggleIsMinimized = () => {
    const challengeId = _get(this.props.task, 'parent.id')
    if (_isNumber(challengeId)) {
      this.props.setChallengeMinimization(challengeId, !this.props.minimizeChallenge)
    }
  }

  render() {
    if (!this.props.task) {
      return null
    }

    const isEditingTask = _get(this, 'props.editor.taskId') === this.props.task.id &&
                          _get(this, 'props.editor.success') === true

    // Don't let sidebar be minimized if there is no current user or if the
    // task is being edited, as the controls in both cases need the extra
    // real-estate.
    const canBeMinimized = this.props.user && !isEditingTask
    const isMinimized = canBeMinimized && this.props.minimizeChallenge

    const minimizerButton =
      !canBeMinimized ? null :
      <button className="toggle-minimization" onClick={this.toggleIsMinimized} />

    const taskInstructions = !_isEmpty(this.props.task.instruction) ?
                             this.props.task.instruction :
                             _get(this.props.task, 'parent.instruction')
    let infoPopout = null
    let commentPopout = null
    if (isMinimized) {
      const infoPopoutButton = (
        <button className="button is-clear active-task-details__info-control">
          <span className="icon"
                title={this.props.intl.formatMessage(messages.info)}>

            <SvgSymbol viewBox='0 0 20 20' sym="info-icon" />
          </span>
        </button>
      )

      infoPopout = (
        <DeactivatablePopout direction='right'
                             className='active-task-details__info-popout'
                             control={infoPopoutButton}>
          <h3 className="info-popout--name">
            {_startCase(_get(this.props.task, 'parent.name'))}
          </h3>

          <div className="info-popout--project-name">
            {_get(this.props.task, 'parent.parent.displayName')}
          </div>

          <div className='info-popout--instructions'>
            <MarkdownContent markdown={taskInstructions} />
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

          <h3>
            <FormattedMessage {...messages.comments} />
          </h3>
          <CommentList comments={this.props.task.comments} />
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

        <div className="task-content" key={`task-content-${this.props.task.id}`}>
          {isMinimized && infoPopout}
          {isMinimized && commentPopout}

          <div className="active-task-details--heading primary-heading">
            <FormattedMessage {...messages.challengeHeading} />
          </div>

          <h2 className="active-task-details--name">
            {_startCase(_get(this.props.task, 'parent.name'))}
          </h2>

          <div className="active-task-details--project-name
                          active-task-details--bordered">
            {_get(this.props.task, 'parent.parent.displayName')}
          </div>

          {!isMinimized &&
            <div>
              {!_isEmpty(taskInstructions) &&
                <div className={classNames('active-task-details--instructions',
                                            {'active-task-details--bordered': !isMinimized})}>
                  <div className="active-task-details--sub-heading">
                    <FormattedMessage {...messages.instructions} />
                  </div>
                  <MarkdownContent markdown={taskInstructions} />
                </div>
              }
            </div>
          }

          <ActiveTaskControls className="active-task-details__controls"
                              isMinimized={isMinimized}
                              {...this.props} />

          <TaskSaveControls className="active-task-details--save-controls"
                            isMinimized={isMinimized}
                            {...this.props} />

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
                  <OverviewMap key={this.props.task.id} task={this.props.task} {...this.props} />
                </div>

                <PlaceDescription place={this.props.task.place}
                                  className="active-task-details--place active-task-details--bordered"/>
              </div>
            </Delayed>
          }

          <div className="active-task-details--sub-heading">
            <FormattedMessage {...messages.social} />
          </div>
          <ChallengeShareControls className={classNames('active-task-details__share-controls',
                                                        {'active-task-details--bordered': !isMinimized,
                                                         'is-minimized': isMinimized})}
                                  challenge={this.props.task.parent} />

          <div className="active-task-details__task-comments">
            <div className="active-task-details--sub-heading">
              <FormattedMessage {...messages.comments} />
              <CommentCountBadge comments={_get(this.props, 'task.comments')} />
            </div>

            <CommentList comments={this.props.task.comments} />
          </div>
        </div>
      </Sidebar>
    )
  }
}

ActiveTaskDetails.propTypes = {
  task: PropTypes.object,
  setChallengeMinimization: PropTypes.func.isRequired,
}

ActiveTaskDetails.defaultProps = {
  minimizeChallenge: false,
}

export default injectIntl(ActiveTaskDetails)
