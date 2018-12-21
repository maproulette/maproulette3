import React, { Component } from 'react';
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _isEmpty from 'lodash/isEmpty'
import _slice from 'lodash/slice'
import _sortBy from 'lodash/sortBy'
import _each from 'lodash/each'
import _find from 'lodash/find'
import _filter from 'lodash/filter'
import _isObject from 'lodash/isObject'
import _differenceBy from 'lodash/differenceBy'
import { RESULTS_PER_PAGE } from '../../../services/Search/Search'

export default function(WrappedComponent,
                        projectsProp,
                        outputProp) {
  class WithPagedProjects extends Component {
    render() {
      const currentPage = _get(this.props, 'searchPage.currentPage', 0)
      const resultsPerPage = _get(this.props, 'searchPage.resultsPerPage', RESULTS_PER_PAGE)
      const numberResultsToShow = (currentPage + 1) * resultsPerPage

      let pagedProjects = this.props[projectsProp]

      const hasMoreResults = (pagedProjects.length > numberResultsToShow) || this.props.isLoading

      // Only sort by display name if we do not have a challenge search going. We are
      // also only going to only show numberResultsToShow projects if we are paging all
      // projects.
      if (!this.props.adminChallengesSearchActive) {
        pagedProjects = _sortBy(pagedProjects, (p) => (p.displayName || p.name).toLowerCase())

        // Grab ths pinnedProjects first so they don't get lost when we chunk.
        let pinnedProjects = _filter(
          pagedProjects,
          project => this.props.pinnedProjects.indexOf(project.id) !== -1
        )

        // Then chunk of everything else.
        pagedProjects = _differenceBy(pagedProjects, pinnedProjects, 'id')
        pagedProjects = _slice(pagedProjects, 0, numberResultsToShow)

        // Now we want pinned projects first followed by the rest of the sorted projects
        pagedProjects = pinnedProjects.concat(pagedProjects)
      }
      else {
         // Otherwise sort by the fuzzy search score. We want to move any matching
         // challenges (and their project parents) up toward the top of the results.
        _each(this.props.filteredChallenges, (c) => {
          const parent = _find(pagedProjects, (p) => p.id === (_isObject(c.parent) ? c.parent.id : c.parent))
          if (!parent.score || c.score < parent.score) {
            parent.score = c.score
          }
        })

        pagedProjects = _sortBy(pagedProjects, (p) => p.score)
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
