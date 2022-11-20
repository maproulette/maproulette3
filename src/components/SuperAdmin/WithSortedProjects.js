import React, { Component } from 'react';
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'
import _toLower from 'lodash/toLower'
import { SORT_NAME, SORT_CREATED, SORT_OLDEST, SORT_NUM_OF_CHALLENGES } from '../../services/Search/Search';
import AsManageableProject from '../../interactions/Project/AsManageableProject';

export const sortProjects = function(props, projectsProp='projects') {
  const sortCriteria = _get(props, 'searchSort.sortBy')
  let sortedProjects = props[projectsProp]
  if (sortCriteria === SORT_NAME) {
    sortedProjects = _sortBy(sortedProjects, (p) => _toLower(p.name))
  }
  else if (sortCriteria === SORT_CREATED) {
    sortedProjects = _reverse(_sortBy(sortedProjects,
      p => p.created ? p.created : ''))
  }
  else if (sortCriteria === SORT_OLDEST) {
    sortedProjects = (_sortBy(sortedProjects, 
      p => p.created ? p.created : ''))
  }
  else if (sortCriteria === SORT_NUM_OF_CHALLENGES) {
     sortedProjects = (_sortBy(sortedProjects, 
      p => {
        const projectManage= AsManageableProject(p)
        return(projectManage.childChallenges(props.challenges).length)
      }))
  }
  return sortedProjects
}

export default function(WrappedComponent,
                        projectsProp='projects',
                        outputProp) {
  class WithSortedProjects extends Component {
    render() {
      const sortedProjects = sortProjects(this.props, projectsProp)

      if (_isEmpty(outputProp)) {
        outputProp = projectsProp
      }

      return <WrappedComponent {...{[outputProp]: sortedProjects}}
                               {..._omit(this.props, outputProp)} />
    }
  }

  WithSortedProjects.propTypes = {
    user: PropTypes.object,
    projects: PropTypes.array,
  }

  return WithSortedProjects
}
