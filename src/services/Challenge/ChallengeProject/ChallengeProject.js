import _get from 'lodash/get'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _isObject from 'lodash/isObject'

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

    const virtualParents = _get(challenge, 'virtualParents', [])
    for (let i = 0; i < virtualParents.length; i++) {
      const vp = virtualParents[i]
      if (_isObject(vp) && vp.enabled) {
        if (_includes(vp.displayName.toLowerCase(),
                      challengeFilters.project.toLowerCase())) {
          return true
        }
      }
    }


    // Just look for a basic case-insensitive substring
    if (!_includes(challenge.parent.displayName.toLowerCase(),
                   challengeFilters.project.toLowerCase())) {
      return false
    }
  }

  return true
}
