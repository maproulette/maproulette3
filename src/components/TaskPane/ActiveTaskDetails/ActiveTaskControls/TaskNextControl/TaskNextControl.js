import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './TaskNextControl.css'

/**
 * TaskNextControl displays a control for loading a new task without altering
 * the status of the current task. It's intended to be displayed for tasks that
 * have already been given a status, offering the user a chance to move on to
 * another task.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskNextControl extends Component {
  render() {
    if (this.props.isMinimized) {
      return (
        <button className={classNames("button icon-only next-control",
                                      this.props.className)}
                onClick={() => this.props.nextTask(this.props.task.parent.id,
                                                    this.props.task.id)}>
          <span className="control-icon"
                title={this.props.intl.formatMessage(messages.nextTooltip)}>
            <SvgSymbol viewBox='0 0 20 20' sym="forward-icon" />
          </span>
        </button>
      )
    }
    else {
      return (
        <div className="has-centered-children">
          <button className={classNames("button is-green is-outlined next-control",
                                        this.props.className)}
                  onClick={() => this.props.nextTask(this.props.task.parent.id, this.props.task.id)}
                  title={this.props.intl.formatMessage(messages.nextTooltip)}>
            <FormattedMessage {...messages.nextLabel} />
            <SvgSymbol viewBox='0 0 20 20' sym="forward-icon" />
          </button>
        </div>
      )
    }
  }
}

TaskNextControl.propTypes = {
  /** The current active task */
  task: PropTypes.object.isRequired,
  /** Invoked if the user desires to load a new task */
  nextTask: PropTypes.func.isRequired,
  /** Set to true to render in a minimized form */
  isMinimized: PropTypes.bool,
}

TaskNextControl.defaultProps = {
  isMinimized: false,
}
