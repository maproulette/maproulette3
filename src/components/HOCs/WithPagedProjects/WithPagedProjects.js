import React, { Component } from 'react';
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _isEmpty from 'lodash/isEmpty'
import _slice from 'lodash/slice'
import _sortBy from 'lodash/sortBy'
import _filter from 'lodash/filter'
import _reverse from 'lodash/reverse'
import { RESULTS_PER_PAGE } from '../../../services/Search/Search'

export default function(WrappedComponent,
                        projectsProp,
                        outputProp) {
  class WithPagedProjects extends Component {
    render() {
      const currentPage = _get(this.props, 'searchPage.currentPage') || 0
      const resultsPerPage = _get(this.props, 'searchPage.resultsPerPage') || RESULTS_PER_PAGE
      const numberResultsToShow = (currentPage + 1) * resultsPerPage

      let pagedProjects = this.props[projectsProp]

      const hasMoreResults = (pagedProjects.length > numberResultsToShow) || this.props.isLoading

      // Only sort by display name if we do not have a challenge search going
      if (!this.props.adminChallengesSearchActive) {
        pagedProjects = _sortBy(pagedProjects, (p) => p.displayName.toLowerCase())
        pagedProjects = _slice(pagedProjects, 0, numberResultsToShow)
      }
      // Otherwise sort by the number of matching challenges
      else {
        pagedProjects = _reverse(_sortBy(pagedProjects, (p) => {
          return _filter(this.props.filteredChallenges, (c) => c.parent === p.id).length
        }))
      }

      if (_isEmpty(outputProp)) {
        outputProp = projectsProp
      }

      return <WrappedComponent hasMoreResults={hasMoreResults}
                               {...{[outputProp]: pagedProjects}}
                               {..._omit(this.props, outputProp)} />
    }
  }

  WithPagedProjects.propTypes = {
    user: PropTypes.object,
  }

  return WithPagedProjects
}
