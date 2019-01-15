import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import classNames from 'classnames'
import _map from 'lodash/map'
import AppErrors from '../../../../services/Error/AppErrors'
import WithErrors from '../../../HOCs/WithErrors/WithErrors'
import BlockGrid from '../BlockGrid/BlockGrid'
import QuickTextBox from '../../../QuickTextBox/QuickTextBox'
import IconButton from '../../../IconButton/IconButton'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import messages from './Messages'
import './Dashboard.scss'

/**
 * Renders a dashboard with the given configuration, expanding it with default
 * settings as needed. Only blocks compatible with the given data targets will
 * be shown or offered.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class Dashboard extends Component {
  state = {
    isEditingId: null,
  }

  startRenamingConfiguration = (conf=this.props.currentConfiguration) => {
    this.setState({
      isEditingId: conf.id,
      newConfigurationName: conf.label,
    })
  }

  setNewName = newConfigurationName => this.setState({newConfigurationName})

  renameConfiguration = () => {
    this.props.renameDashboardConfiguration(this.state.isEditingId,
                                            this.state.newConfigurationName)
    this.setState({isEditingId: null})
  }

  addConfiguration = () => {
    const newConf = this.props.addNewDashboardConfiguration()
    this.startRenamingConfiguration(newConf)
  }

  deleteConfiguration = () => {
    this.props.deleteDashboardConfiguration(this.props.currentConfiguration.id)
  }

  componentDidCatch(error, info) {
    // Mark this dashboard configuration as broken. This can happen if a
    // dashboard block has a problem. We'll be automatically switched to a
    // working layout (with a fresh one being generated if need be).
    this.props.markDashboardConfigurationBroken()
    this.props.addError(AppErrors.dashboard.renderFailure)
  }

  render() {
    if (!this.props.currentConfiguration) {
      return (
        <div className="pane-loading">
          <BusySpinner />
        </div>
      )
    }

    const tabs = _map(this.props.dashboardConfigurations, conf => {
      const tabLabel =
          conf.id !== this.state.isEditingId ? conf.label :
          <QuickTextBox small
                        text={this.state.newConfigurationName}
                        setText={this.setNewName}
                        done={this.renameConfiguration}
                        cancel={() => this.setState({isEditingId: null})} />

      return (
        <li key={conf.id}
            className={classNames({"is-active": conf.id === this.props.currentConfiguration.id})}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a onClick={() => this.props.switchDashboardConfiguration(conf.id)}>{tabLabel}</a>
        </li>
      )
    })

    return (
      <div className="dashboard">
        <div className="dashboard__tab-row">
          <div className="dashboard__tab-row__tabs">
            <div className="tabs medium">
              <ul>{tabs}</ul>
            </div>
          </div>

          <div className="dashboard__tab-row__controls">
            <IconButton primary spriteName="pencil-icon"
                        title={this.props.intl.formatMessage(messages.renameConfigurationTooltip)}
                        onClick={() => this.startRenamingConfiguration()} />

            <IconButton primary spriteName="dashboard-add-icon"
                        title={this.props.intl.formatMessage(messages.addConfigurationTooltip)}
                        onClick={this.addConfiguration} />

            <ConfirmAction>
              <IconButton danger spriteName="trash-icon"
                          title={this.props.intl.formatMessage(messages.deleteConfigurationTooltip)}
                          onClick={this.deleteConfiguration} />
            </ConfirmAction>
          </div>
        </div>
        <BlockGrid {...this.props} dashboard={this.props.currentConfiguration} />
      </div>
    )
  }
}

Dashboard.propTypes = {
  name: PropTypes.string.isRequired,
  targets: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]).isRequired,
  defaultConfiguration: PropTypes.func.isRequired,
}

export default WithErrors(injectIntl(Dashboard))
