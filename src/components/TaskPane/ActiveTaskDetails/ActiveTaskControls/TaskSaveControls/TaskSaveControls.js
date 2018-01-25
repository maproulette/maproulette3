import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import { findIndex as _findIndex } from 'lodash'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

export default class TaskSaveControls extends Component {
  render() {
    if (!this.props.user || !this.props.task) {
      return null
    }

    let saveTaskButton = null
    let unsaveTaskButton = null

    if (_findIndex(this.props.user.savedTasks, {id: this.props.task.id}) !== -1) {
      unsaveTaskButton = (
        <p className="control">
          <button className={classNames("button save-task-toggle unsave-task",
                                        {"large-and-wide": !this.props.isMinimized,
                                        "icon-only": this.props.isMinimized})}
                  onClick={() => this.props.unsaveTask(this.props.user.id, this.props.task.id)}>
            <span className="control-icon"
                  title={this.props.intl.formatMessage(messages.unsave)}>
              <SvgSymbol viewBox='0 0 20 20' sym="save-disk-icon" />
            </span>
            <span className="control-label">
              <FormattedMessage {...messages.unsave} />
            </span>
          </button>
        </p>
      )
    }
    else {
      saveTaskButton = (
        <p className="control">
          <button className={classNames("button save-task-toggle save-task",
                                        {"large-and-wide": !this.props.isMinimized,
                                        "icon-only": this.props.isMinimized})}
                  onClick={() => this.props.saveTask(this.props.user.id, this.props.task.id)}>
            <span className="control-icon"
                  title={this.props.intl.formatMessage(messages.save)}>
              <SvgSymbol viewBox='0 0 20 20' sym="save-disk-icon" />
            </span>
            <span className="control-label">
              <FormattedMessage {...messages.save} />
            </span>
          </button>
        </p>
      )
    }

    return (
      <div className={classNames("task-save-controls", this.props.className)}>
        {saveTaskButton}
        {unsaveTaskButton}
      </div>
    )
  }
}

TaskSaveControls.propTypes = {
  user: PropTypes.object,
  task: PropTypes.object.isRequired,
  saveTask: PropTypes.func.isRequired,
  unsaveTask: PropTypes.func.isRequired,
}
