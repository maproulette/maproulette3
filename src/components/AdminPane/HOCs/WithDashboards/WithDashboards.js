import React, { Component } from 'react'
import _find from 'lodash/find'
import _isArray from 'lodash/isArray'
import _each from 'lodash/each'
import _isFinite from 'lodash/isFinite'
import _omit from 'lodash/omit'
import { generateDashboardId, migrateDashboard }
       from '../../../../services/Dashboard/Dashboard'
import WithCurrentUser from '../../../HOCs/WithCurrentUser/WithCurrentUser'
import WithStatus from '../../../HOCs/WithStatus/WithStatus'
import BusySpinner from '../../../BusySpinner/BusySpinner'

/**
 * WithDashboards provides the WrappedComponent with access to the saved
 * dashboard configurations as well as various configuration management
 * functions.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithDashboards = function(WrappedComponent,
                                       targets, dashboardName, defaultConfiguration) {
  return class extends Component {
    state = {
      currentConfigurationId: null,
    }

    /**
     * Sets up a brand-new dashboard based on the given default configuration
     * function
     */
    setupDashboard = defaultConfiguration => {
      const conf = defaultConfiguration()
      // Ensure default layout honors properties from each block's descriptor
      for (let i = 0; i < conf.blocks.length; i++) {
        const block = conf.blocks[i]
        conf.layout[i] = Object.assign({}, {
          minW: block.minWidth,
          maxW: block.maxWidth,
          minH: block.minHeight,
          maxH: block.maxHeight,
        }, conf.layout[i])
      }

      return conf
    }

    /**
     * Retrieves all dashboards from the user's app settings
     *
     * @private
     */
    allUserDashboards = () => {
      return this.props.getUserAppSetting(this.props.user, 'dashboards') || {}
    }

    /**
     * Retrieves all configurations for the current dashboard
     *
     * @private
     */
    dashboardConfigurations = () => {
      return this.allUserDashboards()[dashboardName] || {}
    }

    /**
     * Completes a given dashboard configuration, filling in missing fields
     * with reasonable default values.
     *
     * @private
     */
    completeDashboard = initialDashboard => {
      const configuration = Object.assign({
        id: generateDashboardId(),
        targets: _isArray(targets) ? targets : [targets],
        cols: 12,
        rowHeight: 30,
        blocks: [],
        layout: [],
      }, initialDashboard)

      // Generate a simple layout if none provided, with one block per row.
      if (configuration.layout.length === 0) {
        let nextY = 0
        _each(configuration.blocks, blockConf => {
          configuration.layout.push({
            i: generateDashboardId(),
            x: 0, y: nextY,
            w: blockConf.defaultWidth, minW: blockConf.minWidth, maxW: blockConf.maxWidth,
            h: blockConf.defaultHeight, minH: blockConf.minHeight, maxH: blockConf.maxHeight,
          })

          nextY += blockConf.defaultHeight
        })
      }
      else {
        // A layout was provided. If heights and/or widths were omitted, fill
        // them in using component defaults.
        _each(configuration.layout, (blockLayout, index) => {
          if (!_isFinite(blockLayout.w)) {
            blockLayout.w = configuration.blocks[index].defaultWidth
          }

          if (!_isFinite(blockLayout.h)) {
            blockLayout.h = configuration.blocks[index].defaultHeight
          }
        })
      }

      return migrateDashboard(configuration,
                              () => this.setupDashboard(defaultConfiguration))
    }

    /**
     * Change the active dashboard configuration
     */
    switchDashboardConfiguration = dashboardConfigurationId => {
      this.setState({currentConfigurationId: dashboardConfigurationId})
    }

    /**
     * Persist the given dashboard configuration object to the user's app
     * settings.
     */
    saveDashboardConfiguration = dashboardConfiguration => {
      // Assign an id if needed
      if (!dashboardConfiguration.id) {
        dashboardConfiguration.id = generateDashboardId()
      }

      const userDashboards = this.allUserDashboards()
      userDashboards[dashboardConfiguration.name] = Object.assign(
        {},
        userDashboards[dashboardConfiguration.name],
        {[dashboardConfiguration.id]: dashboardConfiguration}
      )

      this.props.updateUserAppSetting(this.props.user.id, {'dashboards': userDashboards})
    }

    /**
     * Delete the given dashboard configuration.
     */
    deleteDashboardConfiguration = dashboardConfigurationId => {
      const userDashboards = this.allUserDashboards()

      if (userDashboards[dashboardName]) {
        delete userDashboards[dashboardName][dashboardConfigurationId]
        this.props.updateUserAppSetting(this.props.user.id, {'dashboards': userDashboards})
      }

      if (this.state.currentConfigurationId === dashboardConfigurationId) {
        this.setState({currentConfigurationId: null})
      }
    }

    /**
     * Assign a new name to the given dashboard configuration
     */
    renameDashboardConfiguration = (dashboardConfigurationId, newLabel) => {
      const configuration = this.dashboardConfigurations()[dashboardConfigurationId]

      if (configuration) {
        this.saveDashboardConfiguration(Object.assign({}, configuration, {label: newLabel}))
      }
    }

    /**
     * Retrieve the current, active configuration or a default configuration if
     * there is no active configuration
     */
    currentConfiguration = configurations => {
      let currentDashboard = configurations[this.state.currentConfigurationId]

      // If no current dashboard, or it's broken, find a working one
      if (!currentDashboard) {
        currentDashboard = _find(configurations, configuration => !configuration.isBroken)
      }

      // If no working dashboard, create a fresh default. Once the save is
      // complete, we should get rerendered and have it available, so do not
      // assign it to currentDashboard.
      if (!currentDashboard) {
        this.saveDashboardConfiguration(this.setupDashboard(defaultConfiguration))
      }

      return !currentDashboard ? null : this.completeDashboard(currentDashboard)
    }

    /**
     * Add a new, default dashboard configuration
     */
    addNewDashboardConfiguration = () => {
      const newConfiguration = this.setupDashboard(defaultConfiguration)
      newConfiguration.label = `(New) ${newConfiguration.label}`

      this.saveDashboardConfiguration(newConfiguration)
      setTimeout(() => this.setState({currentConfigurationId: newConfiguration.id}), 500)
      return newConfiguration
    }

    /**
     * Mark the current active dashboard as broken.
     */
    markDashboardConfigurationBroken = () => {
      if (this.state.currentConfigurationId) {
        this.saveDashboardConfiguration(
          Object.assign({},
                        this.currentConfiguration(this.dashboardConfigurations()),
                        {isBroken: true}))
        this.setState({currentConfigurationId: null})
      }
    }

    render() {
      // If we're still fetching user data, show a busy spinner
      if (this.props.checkingLoginStatus) {
        return (
          <div className="pane-loading">
            <BusySpinner />
          </div>
        )
      }

      if (!this.props.user.isLoggedIn) {
        return null
      }

      const configurations = this.dashboardConfigurations()
      const currentConfiguration = this.currentConfiguration(configurations)
      const remainingConfigurations = currentConfiguration ?
                                      _omit(configurations, [currentConfiguration.id]) :
                                      configurations

      return <WrappedComponent
              {...this.props}
              name={dashboardName}
              targets={targets}
              defaultConfiguration={defaultConfiguration}
              dashboardConfigurations={configurations}
              currentConfiguration={currentConfiguration}
              remainingConfigurations={remainingConfigurations}
              currentDashboardConfigurationId={this.state.currentConfigurationId}
              switchDashboardConfiguration={this.switchDashboardConfiguration}
              markDashboardConfigurationBroken={this.markDashboardConfigurationBroken}
              renameDashboardConfiguration={this.renameDashboardConfiguration}
              addNewDashboardConfiguration={this.addNewDashboardConfiguration}
              saveDashboardConfiguration={this.saveDashboardConfiguration}
              deleteDashboardConfiguration={this.deleteDashboardConfiguration} />
    }
  }
}

export default (WrappedComponent, targets, dashboardName, defaultConfiguration) =>
  WithStatus(
    WithCurrentUser(
      WithDashboards(WrappedComponent, targets, dashboardName, defaultConfiguration)
    )
  )
