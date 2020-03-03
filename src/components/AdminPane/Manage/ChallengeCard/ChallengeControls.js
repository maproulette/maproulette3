import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import AsManager from '../../../../interactions/User/AsManager'
import AsManageableChallenge
       from '../../../../interactions/Challenge/AsManageableChallenge'
import { ChallengeStatus, isUsableChallengeStatus }
       from  '../../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import RebuildTasksControl from '../RebuildTasksControl/RebuildTasksControl'
import ProjectPickerModal from '../ProjectPickerModal/ProjectPickerModal'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import messages from '../ChallengeDashboard/Messages'

export default class ChallengeControls extends Component {
  state = {
    pickingProject: false,
  }

  projectPickerCanceled = () => {
    this.setState({pickingProject: false})
    this.props.onControlComplete && this.props.onControlComplete()
  }

  moveToProject = project => {
    this.setState({pickingProject: false})
    this.props.moveChallenge(this.props.challenge.id, project.id)
    this.props.onControlComplete && this.props.onControlComplete()
  }

  deleteChallenge = () => {
    this.props.deleteChallenge(this.props.challenge.parent.id,
                               this.props.challenge.id)
  }

  render() {
    const inVirtualProject = _get(this.props, 'project.isVirtual', false)
    const manager = AsManager(this.props.user)
    const projectId = _get(this.props, 'challenge.parent.id')
    const status = _get(this.props, 'challenge.status', ChallengeStatus.none)
    const hasTasks = _get(this.props, 'challenge.actions.total', 0) > 0

    return (
      <div className={this.props.className}>
        {hasTasks && isUsableChallengeStatus(status, true) &&
          <Link
            to={`/challenge/${this.props.challenge.id}`}
            className={this.props.controlClassName}
          >
            <FormattedMessage {...messages.startChallengeLabel} />
          </Link>
        }

        {!inVirtualProject &&
         manager.canWriteProject(this.props.challenge.parent) &&
          <React.Fragment>
            <Link
              to={`/admin/project/${projectId}/` +
                  `challenge/${this.props.challenge.id}/edit`}
              className={this.props.controlClassName}
            >
              <FormattedMessage {...messages.editChallengeLabel } />
            </Link>

            {manager.canAdministrateProject(this.props.challenge.parent) &&
             // eslint-disable-next-line jsx-a11y/anchor-is-valid
             <a
               onClick={() => this.setState({pickingProject: true})}
               className={this.props.controlClassName}
             >
               <FormattedMessage {...messages.moveChallengeLabel} />
             </a>
            }

            {this.props.onChallengeDashboard &&
             AsManageableChallenge(this.props.challenge).isRebuildable() &&
              <RebuildTasksControl {...this.props} />
            }

            <Link
              to={{
                pathname: `/admin/project/${projectId}/` +
                          `challenge/${this.props.challenge.id}/clone`,
                state: {cloneChallenge: true}
              }}
              className={this.props.controlClassName}
            >
              <FormattedMessage {...messages.cloneChallengeLabel } />
            </Link>

            {manager.canAdministrateProject(this.props.challenge.parent) &&
             <ConfirmAction>
               {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
               <a
                 onClick={this.deleteChallenge}
                 className={this.props.controlClassName}
               >
                 <FormattedMessage {...messages.deleteChallengeLabel } />
               </a>
             </ConfirmAction>
            }
            {this.state.pickingProject &&
             <ProjectPickerModal
                {...this.props}
                currentProjectId={projectId}
                onCancel={this.projectPickerCanceled}
                onSelectProject={this.moveToProject}
              />
            }
          </React.Fragment>
        }
      </div>
    )
  }
}

ChallengeControls.propTypes = {
  /** The current challenge to view */
  challenge: PropTypes.object,
  /** Invoked when the user wishes to delete the challenge */
  deleteChallenge: PropTypes.func.isRequired,
  /** Invoked when the user wishes to move the challenge */
  moveChallenge: PropTypes.func.isRequired,
  /** Invoked when an in-situ control is completed */
  onControlComplete: PropTypes.func,
  /** Some controls are only available from the challenge dashboard */
  onChallengeDashboard: PropTypes.bool,
}
