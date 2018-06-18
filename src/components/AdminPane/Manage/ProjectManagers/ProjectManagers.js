import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _without from 'lodash/without'
import { GroupType,
         mostPrivilegedGroupType,
         messagesByGroupType }
       from '../../../../services/Project/GroupType/GroupType'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import messages from './Messages'
import './ProjectManagers.css'

/**
 * ProjectManagers displays a list of the current managers of the given
 * project, along with options for adding new managers and adjusting
 * role of -- or removing -- existing ones.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ProjectManagers extends Component {
  state = {
    loadingManagers: true,
    updatingManagers: [],
    addManagerUsername: '',
    addingManager: false,
  }

  componentDidMount() {
    this.props.fetchProjectManagers(this.props.project.id).then(() =>
      this.setState({loadingManagers: false})
    )
  }

  updateManagerRole = (managerOsmId, groupType) => {
    this.setState({
      updatingManagers: this.state.updatingManagers.concat([managerOsmId])
    })

    this.props.setProjectManagerGroupType(
      this.props.project.id, managerOsmId, groupType
    ).then(() => this.setState({
      updatingManagers: _without(this.state.updatingManagers, managerOsmId)
    }))
  }

  removeManager = managerOsmId => {
    this.setState({
      updatingManagers: this.state.updatingManagers.concat([managerOsmId])
    })

    this.props.removeProjectManager(
      this.props.project.id, managerOsmId
    ).then(() => this.setState({
      updatingManagers: _without(this.state.updatingManagers, managerOsmId)
    }))
  }

  addManager = groupType => {
    this.setState({addingManager: true})

    this.props.addProjectManager(
      this.props.project.id, this.state.addManagerUsername, groupType
    ).then(() => this.setState({
      addManagerUsername: '',
      addingManager: false,
    }))
  }

  render() {
    if (!this.props.project || this.state.loadingManagers) {
      return <BusySpinner />
    }

    const groupTypeOptions = [
      <option key={GroupType.read} value={GroupType.read}>
        {this.props.intl.formatMessage(messagesByGroupType[GroupType.read])}
      </option>,

      <option key={GroupType.write} value={GroupType.write}>
        {this.props.intl.formatMessage(messagesByGroupType[GroupType.write])}
      </option>,

      <option key={GroupType.admin} value={GroupType.admin}>
        {this.props.intl.formatMessage(messagesByGroupType[GroupType.admin])}
      </option>,
    ]

    let managers = _map(this.props.project.managers, manager => {
      return (
        <div key={manager.osmId} className="project-managers__manager">
          <div className="project-managers__manager__about">
            <figure className="image is-24x24 project-managers__manager__profile-pic">
              <img src={manager.avatarURL} alt={manager.displayName} />
            </figure>

            <div className="project-managers__manager__name">
              {manager.displayName}
            </div>
          </div>

          <div className="project-managers__manager__controls">
            {this.state.updatingManagers.indexOf(manager.osmId) !== -1 && <BusySpinner />}

            {manager.osmId === this.props.project.owner ?
             <div className="project-managers__manager__role-placeholder">
               <FormattedMessage {...messages.projectOwner} />
             </div> :
             <select value={mostPrivilegedGroupType(manager.groupTypes)}
                     onChange={e => this.updateManagerRole(manager.osmId, e.target.value)}
                     className="select project-managers__manager__role">
               {groupTypeOptions}
             </select>
            }

            {manager.osmId !== this.props.project.owner &&
             <ConfirmAction prompt={this.props.intl.formatMessage(messages.removeManagerConfirmation)}>
               <a className="button is-clear project-managers__manager__remove-control"
                  onClick={() => this.removeManager(manager.osmId)}
                  title={this.props.intl.formatMessage(messages.removeManagerTooltip)}>
                 <SvgSymbol className='icon is-danger' sym='trash-icon' viewBox='0 0 20 20' />
               </a>
             </ConfirmAction>
            }
          </div>
        </div>
      )
    })

    if (managers.length === 0) {
      managers = (
        <div className="project-managers__none">
          <FormattedMessage {...messages.noManagers} />
        </div>
      )
    }

    return (
      <div className="project-managers">
        {managers}
        <div className="project-managers__add-manager">
          <h3><FormattedMessage {...messages.addManager} /></h3>

          <div className="project-managers__add-manager__form">
            <input className="input" type="text"
                   value={this.state.addManagerUsername}
                   placeholder={this.props.intl.formatMessage(messages.osmUsername)}
                   onChange={e => this.setState({addManagerUsername: e.target.value})}
            />

            {this.state.addingManager && <BusySpinner />}
            {!this.state.addingManager && this.state.addManagerUsername.length > 0 &&
             <select onChange={e => this.addManager(e.target.value)}
                     className="select project-managers__add-manager__group-type">
                     {[<option key='none' value=''>
                         {this.props.intl.formatMessage(messages.chooseRole)}
                       </option>
                      ].concat(groupTypeOptions)}
             </select>
            }
          </div>
        </div>
      </div>
    )
  }
}

ProjectManagers.propTypes = {
  /** The project being managed */
  project: PropTypes.object,
  /** Invoked to modify the group type of a manager */
  setProjectManagerGroupType: PropTypes.func.isRequired,
  /** Invoked to remove a project manager */
  removeProjectManager: PropTypes.func.isRequired,
}

