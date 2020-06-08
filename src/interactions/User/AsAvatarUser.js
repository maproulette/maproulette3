import _get from 'lodash/get'
import defaultPic from '../../static/images/user_no_image.png'

/**
 * AsAvatarUser adds functionality to a User related to a general user.
 */
export class AsAvatarUser {
  constructor(user) {
    Object.assign(this, user)
  }

  rawAvatarURL() {
    return this.avatarURL || _get(this.osmProfile, 'avatarURL')
  }

  profilePic(size) {
    const urlParts = this.rawAvatarURL().replace(/\?s=\d+/, '?').split('?')
    return /user_no_image/.test(this.rawAvatarURL()) ? defaultPic :
           `${urlParts[0]}?s=${size}&${urlParts.slice(1).join('?')}`
  }
}

export default user => new AsAvatarUser(user)
