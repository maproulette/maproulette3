import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import _map from 'lodash/map'
import _filter from 'lodash/filter'
import _without from 'lodash/without'
import _isFinite from 'lodash/isFinite'
import { GroupType,
         mostPrivilegedGroupType,
         messagesByGroupType }
       from '../../../../../services/Project/GroupType/GroupType'
import WithOSMUserSearch from '../../../HOCs/WithOSMUserSearch/WithOSMUserSearch'
import AsManager from '../../../../../interactions/User/AsManager'
import BusySpinner from '../../../../BusySpinner/BusySpinner'
import AutosuggestTextBox from '../../../../AutosuggestTextBox/AutosuggestTextBox'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import ConfirmAction from '../../../../ConfirmAction/ConfirmAction'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import messages from './Messages'
import './ProjectManagersWidget.scss'

const descriptor = {
  widgetKey: 'ProjectManagersWidget',
  label: messages.title,
  targets: [WidgetDataTarget.project],
  minWidth: 3,
  defaultWidth: 4,
  defaultHeight: 8,
}

const ChooseOSMUser = WithOSMUserSearch(AutosuggestTextBox)

export default class ProjectManagersWidget extends Component {
  state = {
    loadingManagers: true,
    updatingManagers: [],
    addManagerUsername: '',
    addManagerOSMUser: null,
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
    if (!_isFinite(parseInt(groupType, 10))) {
      return
    }

    this.setState({addingManager: true})

    this.props.addProjectManager(
      this.props.project.id, this.state.addManagerUsername, groupType
    ).then(() => this.setState({
      addManagerUsername: '',
      addManagerOSMUser: null,
      addingManager: false,
    }))
  }

  render() {
    if (!this.props.project || this.state.loadingManagers) {
      return <BusySpinner />
    }

    const user = AsManager(this.props.user)

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

    const adminManagers =
      _filter(this.props.project.managers,
              manager => mostPrivilegedGroupType(manager.groupTypes) === GroupType.admin)

    let managers = _map(this.props.project.managers, manager => {
      const managerRole = mostPrivilegedGroupType(manager.groupTypes)
      const isProjectOwner = manager.osmId === this.props.project.owner
      const isLastAdmin = managerRole === GroupType.admin && adminManagers.length < 2

      return (
        <div key={manager.osmId} className="project-managers__manager mr-pr-4">
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

            {isLastAdmin || isProjectOwner ?
             <div className="project-managers__manager__role-placeholder">
               {isProjectOwner ?
                <FormattedMessage {...messages.projectOwner} /> :
                <FormattedMessage {...messagesByGroupType[managerRole]} />
               }
             </div> :
             <select value={managerRole}
                     disabled={!user.canAdministrateProject(this.props.project)}
                     onChange={e => this.updateManagerRole(manager.osmId, e.target.value)}
                     className="select project-managers__manager__role mr-bg-grey-lighter mr-rounded mr-px-1">
               {groupTypeOptions}
             </select>
            }

            {user.canAdministrateProject(this.props.project) &&
             !isLastAdmin && !isProjectOwner &&
              <ConfirmAction prompt={this.props.intl.formatMessage(messages.removeManagerConfirmation)}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a className="button is-clear project-managers__manager__remove-control"
                   onClick={() => this.removeManager(manager.osmId)}
                   title={this.props.intl.formatMessage(messages.removeManagerTooltip)}>
                  <SvgSymbol className="mr-fill-blue-dark mr-h-4" sym="trash-icon" viewBox="0 0 20 20" />
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

    const widgetIntro = user.canAdministrateProject(this.props.project) && (
      <div className="project-managers__add-manager mr-mb-4 mr-px-4">
        <h3><FormattedMessage {...messages.addManager} /></h3>

        <div className="project-managers__add-manager__form mr-border mr-p-1">
          <ChooseOSMUser inputValue={this.state.addManagerUsername}
                         selectedItem={this.state.addManagerOSMUser}
                         onInputValueChange={username => this.setState({
                           addManagerUsername: username
                         })}
                         onChange={osmUser => this.setState({
                           addManagerOSMUser: osmUser
                         })}
                         placeholder={this.props.intl.formatMessage(messages.osmUsername)}
                         fixedMenu />
          {this.state.addingManager && <BusySpinner />}
          {!this.state.addingManager && this.state.addManagerOSMUser &&
            <select onChange={e => this.addManager(e.target.value)}
                    className="select project-managers__add-manager__group-type mr-min-w-30 mr-bg-grey-lighter mr-rounded mr-px-1">
                    {[<option key='none' value=''>
                        {this.props.intl.formatMessage(messages.chooseRole)}
                      </option>
                    ].concat(groupTypeOptions)}
            </select>
          }
        </div>
      </div>
    )


    return (
      <QuickWidget
        {...this.props}
        className="project-managers-widget project-managers"
        widgetTitle={<FormattedMessage {...messages.title} />}
        intro={widgetIntro}
      >
        {managers}
      </QuickWidget>
    )
  }
}

registerWidgetType(ProjectManagersWidget, descriptor)
