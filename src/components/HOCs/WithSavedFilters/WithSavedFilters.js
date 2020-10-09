import React, { Component } from 'react'
import _unset from 'lodash/unset'
import { buildSearchURL } from '../../../services/SearchCriteria/SearchCriteria'

/**
 * WithSavedFilters manages the user's app settings and the workflow around
 * saving/managing filters.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
const WithSavedFilters = function(WrappedComponent, appSettingName) {
  return class extends Component {
    state = {
      savingFilters: false,
      managingFilters: false
    }

    /**
     * This will save the current search filters to the user's app settings.
     */
    saveCurrentSearchFilters = (name, currentFilters) => {
      const searchURL = buildSearchURL(currentFilters)
      const settings =
        this.props.getUserAppSetting(this.props.user, appSettingName) || {}
      settings[this.props.pageId] = settings[this.props.pageId] || {}
      settings[this.props.pageId][name] = searchURL
      this.props.updateUserAppSetting(this.props.user.id,
        {[appSettingName]: settings})
    }

    /**
     * This retrieves all the saved search filters
     */
    getSavedFilters = () => {
      const settings = this.props.getUserAppSetting(
        this.props.user, appSettingName) || {}

      return settings[this.props.pageId] || {}
    }

    /**
     * This will remove the given saved search filters from the user's app settings.
     */
    removeSavedFilters = name => {
      const settings =
        this.props.getUserAppSetting(this.props.user, appSettingName) || {}
      settings[this.props.pageId] = settings[this.props.pageId] || {}
      _unset(settings[this.props.pageId], name)
      this.props.updateUserAppSetting(this.props.user.id,
        {[appSettingName]: settings})
    }

    renameSavedFilters = (oldName, newName) => {
      const settings =
        this.props.getUserAppSetting(this.props.user, appSettingName) || {}
      settings[this.props.pageId] = settings[this.props.pageId] || {}
      const searchURL = settings[this.props.pageId][oldName]
      _unset(settings[this.props.pageId], oldName)
      settings[this.props.pageId][newName] = searchURL
      this.props.updateUserAppSetting(this.props.user.id,
        {[appSettingName]: settings})
    }

    render() {
      return <WrappedComponent {...this.props}
                               saveCurrentSearchFilters={this.saveCurrentSearchFilters}
                               savedFilters={this.getSavedFilters()}
                               removeSavedFilters={this.removeSavedFilters}
                               renameSavedFilters={this.renameSavedFilters}
                               manageFilters={() => this.setState({managingFilters: true})}
                               saveFilters={() => this.setState({savingFilters: true})}
                               managingFilters={this.state.managingFilters}
                               savingFilters={this.state.savingFilters}
                               cancelSavingFilters={() =>
                                 this.setState({savingFilters: false})
                               }
                               cancelManagingFilters={() =>
                                 this.setState({managingFilters: false})
                               }/>
    }
  }
}

export default WithSavedFilters
