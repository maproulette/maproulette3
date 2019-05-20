import React, { Component } from 'react'
import _get from 'lodash/get'
import _filter from 'lodash/filter'
import _each from 'lodash/each'
import _uniqBy from 'lodash/uniqBy'
import _isArray from 'lodash/isArray'

/**
 * WithChallengeResultParents ensures that parent projects of the given result
 * challenges are included in the result projects passed down to the
 * WrappedComponent.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithChallengeResultParents = function(WrappedComponent) {
  return class extends Component {
    projectsAndChallengeParents = () => {
      if (_get(this.props, 'filteredChallenges.length', 0) === 0) {
        return this.props.resultProjects
      }

      // If there are pre-filtered projects, use those
      const allProjects = _isArray(this.props.filteredProjects) ?
                          this.props.filteredProjects :
                          this.props.projects

      const projectsWithChallengeSearchResults = new Set()
      _each(this.props.filteredChallenges, c => {
          projectsWithChallengeSearchResults.add(c.parent)
          _each(c.virtualParents, (vp) =>
                  projectsWithChallengeSearchResults.add(vp))
      })

      // Include both project results and projects that have challenge results.
      return _uniqBy(this.props.resultProjects.concat(
        _filter(allProjects,
                project => projectsWithChallengeSearchResults.has(project.id))
      ), 'id')
    }

    render() {
      return <WrappedComponent {...this.props}
                               resultProjects={this.projectsAndChallengeParents()} />
    }
  }
}

export default WrappedComponent => WithChallengeResultParents(WrappedComponent)
