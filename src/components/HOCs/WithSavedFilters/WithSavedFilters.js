import React, { Component } from 'react'
import _unset from 'lodash/unset'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _keys from 'lodash/keys'
import _isFinite from 'lodash/isFinite'
import _compact from 'lodash/compact'
import _split from 'lodash/split'
import { buildSearchURL,
         buildSearchCriteriafromURL }
       from '../../../services/SearchCriteria/SearchCriteria'
import { messagesByPriority, TaskPriority }
       from '../../../services/Task/TaskPriority/TaskPriority'
import { messagesByStatus, TaskStatus }
       from '../../../services/Task/TaskStatus/TaskStatus'
import { messagesByReviewStatus, TaskReviewStatusWithUnset,
         messagesByMetaReviewStatus, TaskMetaReviewStatusWithUnset }
       from '../../../services/Task/TaskReview/TaskReviewStatus'

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

    // This will turn an integer or array value into
    // the appropriate messages.
    // ie. [0, 1] -> "high, medium" or [1, 2] -> "approved, rejected"
    makeBrief(value, AllOptions, messages) {
      let textValue = value
      if (_isFinite(value) || value.indexOf(",") > -1) {
        const splitValues = _split(value, ",")

        // If every value is present in the array then we don't
        // need to include this value in the brief description so
        // just return null.
        if (splitValues.length === _keys(AllOptions).length) {
          textValue = null
        }
        else {
          textValue = _map(splitValues, v =>
            this.props.intl.formatMessage(messages[v])).join(',')
        }
      }
      return textValue
    }

    getBriefFilters = savedFilters => {
      const criteria = buildSearchCriteriafromURL(savedFilters)

      return _compact(_map(criteria.filters, (value, key) => {
        let op = '='
        let textValue = value
        if (_get(criteria.invertFields, key)) {
          op = '!='
        }
        if (key === "priority" && _isFinite(value)) {
          textValue = this.props.intl.formatMessage(messagesByPriority[value])
        }
        else if (key === "priorities") {
          textValue = this.makeBrief(value, TaskPriority, messagesByPriority)
        }
        if (key === "status") {
          textValue = this.makeBrief(value, TaskStatus, messagesByStatus)
        }
        if (key === "reviewStatus") {
          textValue = this.makeBrief(value, TaskReviewStatusWithUnset, messagesByReviewStatus)
        }
        if (key === "metaReviewStatus") {
          textValue = this.makeBrief(value, TaskMetaReviewStatusWithUnset, messagesByMetaReviewStatus)
        }
        return textValue ? `${key}${op}${textValue}` : null
      }))
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
                               }
                               getBriefFilters={this.getBriefFilters}/>
    }
  }
}

export default WithSavedFilters
