import _filter from 'lodash/filter'
import _isObject from 'lodash/isObject'

/**
 * AsManageable adds functionality to a Project related to management.
 */
export class AsManageableProject {
  constructor(project) {
    Object.assign(this, project)
  }

  childChallenges(challenges) {
    return _filter(challenges, challenge =>
      _isObject(challenge.parent) ? challenge.parent.id === this.id :
                                    challenge.parent === this.id
    )
  }
}

export default project => new AsManageableProject(project)
