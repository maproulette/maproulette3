import _get from 'lodash/get'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'

/**
 * Returns true if the given challenge passes the project-name filter in the
 * given challenge filters
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const challengePassesProjectFilter = function(challengeFilters,
                                                     challenge,
                                                     searchCriteria) {
  if (!_isEmpty(challengeFilters.project)) {
    if (!_get(challenge, 'parent.displayName')) {
      return false
    }

    // Just look for a basic case-insensitive substring
    if (!_includes(challenge.parent.displayName.toLowerCase(),
                   challengeFilters.project.toLowerCase())) {
      return false
    }
  }

  return true
}
