import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import AsManager from '../../../interactions/User/AsManager'
import messages from './Messages'
import './TaskManageControls.scss'

export default class TaskManageControls extends Component {
  render() {
    const isManageable =
      AsManager(this.props.user).canManageChallenge(_get(this.props, 'task.parent'))

    if (!isManageable ||
        !_isFinite(_get(this.props, 'task.parent.parent.id'))) {
      return null
    }

    const challenge = this.props.task.parent
    const project = challenge.parent
    const manageBasePath =
      `/admin/project/${project.id}/challenge/${challenge.id}/task/${this.props.task.id}`

    return (
      <div className="active-task-controls__task-manage-controls">
        <h3><FormattedMessage {...messages.heading} /></h3>
        <div className="active-task-controls__task-manage-controls__options">
          <Link to={`${manageBasePath}/inspect`}>
            <FormattedMessage {...messages.inspectLabel} />
          </Link>
          <Link to={`${manageBasePath}/edit`}>
            <FormattedMessage {...messages.modifyLabel} />
          </Link>
        </div>
      </div>
    )
  }
}
