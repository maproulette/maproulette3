import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import _map from 'lodash/map'
import _filter from 'lodash/filter'
import _without from 'lodash/without'
import _isFinite from 'lodash/isFinite'
import { Role,
         mostPrivilegedRole,
         messagesByRole }
       from '../../../../../services/Grant/Role'
import WithOSMUserSearch from '../../../HOCs/WithOSMUserSearch/WithOSMUserSearch'
import AsManager from '../../../../../interactions/User/AsManager'
import AsAvatarUser from '../../../../../interactions/User/AsAvatarUser'
import BusySpinner from '../../../../BusySpinner/BusySpinner'
import AutosuggestTextBox from '../../../../AutosuggestTextBox/AutosuggestTextBox'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import messages from './Messages'

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

  updateManagerRole = (managerOsmId, role) => {
    if (role === 'remove') {
      this.removeManager(managerOsmId)
      return
    }

    this.setState({
      updatingManagers: this.state.updatingManagers.concat([managerOsmId])
    })

    this.props.setProjectManagerRole(
      this.props.project.id, managerOsmId, true, role
    ).then(() => this.setState({
      updatingManagers: _without(this.state.updatingManagers, managerOsmId)
    }))
  }

  removeManager = (managerOsmId) => {
    this.setState({
      updatingManagers: this.state.updatingManagers.concat([managerOsmId])
    })

    this.props.removeProjectManager(
      this.props.project.id, managerOsmId, true
    ).then(() => this.setState({
      updatingManagers: _without(this.state.updatingManagers, managerOsmId)
    }))
  }

  addManager = role => {
    if (!_isFinite(parseInt(role, 10))) {
      return
    }

    this.setState({addingManager: true})

    this.props.addProjectManager(
      this.props.project.id, this.state.addManagerUsername, role
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

    const roleOptions = [
      <option key={Role.read} value={Role.read}>
        {this.props.intl.formatMessage(messagesByRole[Role.read])}
      </option>,

      <option key={Role.write} value={Role.write}>
        {this.props.intl.formatMessage(messagesByRole[Role.write])}
      </option>,

      <option key={Role.admin} value={Role.admin}>
        {this.props.intl.formatMessage(messagesByRole[Role.admin])}
      </option>,
    ]

    const adminManagers =
      _filter(this.props.project.managers,
              manager => mostPrivilegedRole(manager.roles) === Role.admin)

    let managers = _map(this.props.project.managers, manager => {
      const managerRole = mostPrivilegedRole(manager.roles)
      const isLastAdmin = managerRole === Role.admin && adminManagers.length < 2

      // Add remove-manager option to dropdown if appropriate
      const dropdownOptions =
        user.canAdministrateProject(this.props.project) && !isLastAdmin ?
        roleOptions.concat([
          <option key="remove" value="remove">
            {this.props.intl.formatMessage(messages.removeManagerLabel)}
          </option>
        ]) :
        roleOptions

      return (
        <div key={manager.osmId} className="mr-flex mr-items-center mr-pr-4 mr-mt-4">
          <div className="mr-flex-grow-0 mr-mr-4">
            <figure className="mr-w-8 mr-h-8">
              <img
                src={AsAvatarUser(manager).profilePic(100)}
                alt=""
                className="mr-rounded-full"
              />
            </figure>
          </div>

          <div className="mr-flex-grow-0 mr-links-green-lighter mr-mr-2">
            <Link to={`/user/metrics/${manager.userId}`}>
              {manager.displayName}
            </Link>
          </div>

          <div className="mr-flex-grow mr-border-b mr-border-white-15 mr-mr-4" />

          <div className="mr-flex-grow-0">
            {this.state.updatingManagers.indexOf(manager.osmId) !== -1 && <BusySpinner />}

            {isLastAdmin || !user.canAdministrateProject(this.props.project) ?
             <FormattedMessage {...messagesByRole[managerRole]} /> :
             <select
               value={managerRole}
               onChange={e => this.updateManagerRole(manager.osmId, e.target.value)}
               className="mr-select mr-py-1"
             >
               {dropdownOptions}
             </select>
            }
          </div>
        </div>
      )
    })

    if (managers.length === 0) {
      managers = (
        <div className="mr-text-grey-lighter">
          <FormattedMessage {...messages.noManagers} />
        </div>
      )
    }

    const widgetIntro = user.canAdministrateProject(this.props.project) && (
      <div className="mr-mb-4">
        <h3 className="mr-text-base mr-mb-4">
          <FormattedMessage {...messages.addManager} />
        </h3>

        <div className="mr-flex mr-justify-between">
          <div className="mr-mr-4 mr-flex-grow">
            <ChooseOSMUser
              inputValue={this.state.addManagerUsername}
              inputClassName="mr-py-2 mr-px-4 mr-border-none mr-placeholder-white-50 mr-text-white mr-rounded mr-bg-black-15 mr-shadow-inner"
              selectedItem={this.state.addManagerOSMUser}
              onInputValueChange={username => this.setState({
                addManagerUsername: username
              })}
              onChange={osmUser => this.setState({
                addManagerOSMUser: osmUser
              })}
              placeholder={this.props.intl.formatMessage(messages.osmUsername)}
              fixedMenu
            />
          </div>
          {this.state.addingManager && <BusySpinner />}
          {!this.state.addingManager && this.state.addManagerOSMUser &&
           <select
             onChange={e => this.addManager(e.target.value)}
             className="mr-flex-grow-0 mr-min-w-30 mr-select"
           >
             {[
               <option key='none' value=''>
                 {this.props.intl.formatMessage(messages.chooseRole)}
               </option>
             ].concat(roleOptions)}
           </select>
          }
        </div>
      </div>
    )


    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
        noMain
      >
        {widgetIntro}
        {managers}
      </QuickWidget>
    )
  }
}

registerWidgetType(ProjectManagersWidget, descriptor)
