import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _find from 'lodash/find'
import _values from 'lodash/values'
import { fetchOSMElement } from '../../../services/OSM/OSM'
import { fetchSuggestedTagFixChangeset } from '../../../services/Task/Task'
import { addError } from '../../../services/Error/Error'
import AsSuggestedFix from '../../../interactions/Task/AsSuggestedFix'

/**
 * Provides WrappedComponent with details of a task's suggested fix, along with
 * accessory data such as the latest OSM versions of elements referenced by the
 * fix
 *
 * Note that only tag changes are currently supported by suggested fixes
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithSuggestedFix = function(WrappedComponent) {
  return class extends Component {
    state = {
      loadingOSMData: false,
      osmElements: null,
      tagDiffs: null,
      hasTagChanges: false,
      loadingChangeset: false,
      xmlChangeset: null,
      tagEdits: null,
    }

    loadOSMElements = async (task) => {
      const fix = AsSuggestedFix(task)
      if (!fix.hasSuggestedFix()) {
        return
      }

      this.setState({
        loadingOSMData: true,
        osmElements: null,
        tagDiffs: null,
        tagEdits: null,
        hasTagChanges: false,
      })

      const elementMap = new Map()
      try {
        await Promise.all(fix.existingOSMElementIds().map(async (elementId) => {
          const elementJSON = await fetchOSMElement(elementId)
          elementMap.set(elementId, elementJSON)
        }))
      }
      catch(error) {
        this.props.addError(error)
        this.setState({loadingOSMData: false})
        return
      }

      const tagDiffs = fix.tagDiffs(elementMap)
      const hasTagChanges = this.tagsAreChanged(tagDiffs)

      this.setState({loadingOSMData: false, osmElements: elementMap, tagDiffs, hasTagChanges})
    }

    loadXMLChangeset = async () => {
      if (this.state.xmlChangeset) {
        return
      }

      this.setState({loadingChangeset: true})

      const suggestedFixSummary =
        AsSuggestedFix(this.props.task).tagChangeSummary(this.state.tagEdits)
      if (_isEmpty(suggestedFixSummary)) {
        this.setState({xmlChangeset: '', loadingChangeset: false})
        return
      }

      return fetchSuggestedTagFixChangeset(suggestedFixSummary).then(xml => {
        this.setState({xmlChangeset: xml, loadingChangeset: false})
      }).catch(error => {
        this.setState({xmlChangeset: '', loadingChangeset: false})
      })
    }

    setTagEdits = edits => {
      if (edits === null) {
        return this.revertTagEdits()
      }

      const hasTagChanges = this.tagsAreChanged([edits])
      this.setState({tagEdits: edits, hasTagChanges, xmlChangeset: null})
    }

    revertTagEdits = () => {
      const hasTagChanges = this.tagsAreChanged(this.state.tagDiffs)
      this.setState({tagEdits: null, hasTagChanges, xmlChangeset: null})
    }

    /**
     * Determines if there are any changes in the given tag diffs
     *
     * @private
     */
    tagsAreChanged = tagDiffs => {
      return !!_find(tagDiffs, diff => {
        return !!_find(_values(diff), change => change.status !== 'unchanged')
      })
    }

    componentDidMount() {
      if (this.props.task) {
        this.loadOSMElements(this.props.task)
      }
    }

    componentDidUpdate(prevProps) {
      if (_get(this.props, 'task.id') !== _get(prevProps, 'task.id')) {
        this.loadOSMElements(this.props.task)
      }
    }

    render() {
      return <WrappedComponent
              {...this.props}
              osmElements={this.state.osmElements}
              tagDiffs={this.state.tagEdits ? [ this.state.tagEdits ] : this.state.tagDiffs}
              hasTagChanges={this.state.hasTagChanges}
              xmlChangeset={this.state.xmlChangeset}
              tagEdits={this.state.tagEdits}
              setTagEdits={this.setTagEdits}
              revertTagEdits={this.revertTagEdits}
              loadXMLChangeset={this.loadXMLChangeset}
              loadingOSMData={this.state.loadingOSMData}
              loadingChangeset={this.state.loadingChangeset}
            />
    }
  }
}

export const mapDispatchToProps = dispatch =>
  bindActionCreators({ addError }, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithSuggestedFix(WrappedComponent))
