import _filter from 'lodash/filter'
import _isObject from 'lodash/isObject'
import _indexOf from 'lodash/indexOf'

/**
 * AsManageable adds functionality to a Project related to management.
 */
export class AsManageableProject {
  constructor(project) {
    Object.assign(this, project)
  }

  childChallenges(challenges) {
    return _filter(challenges, challenge =>
      ((_isObject(challenge.parent) ? challenge.parent.id === this.id :
                                      challenge.parent === this.id) ||
        _indexOf(challenge.virtualParents, this.id) !== -1)
    )
  }
}

export default project => new AsManageableProject(project)
