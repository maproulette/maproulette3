import _isEmpty from 'lodash/isEmpty'
import defaultPic from '../../../images/user_no_image.png'

/**
 * AsAvatarUser adds functionality to a User related to a general user.
 */
export class AsAvatarUser {
  constructor(user) {
    Object.assign(this, user)
  }

  rawAvatarURL() {
    return this.avatarURL || (this.osmProfile?.avatarURL);
  }

  profilePic(size) {
    const rawURL = this.rawAvatarURL()
    if (_isEmpty(rawURL) || /user_no_image/.test(rawURL)) {
      return defaultPic
    }

    const urlParts = rawURL.replace(/\?s=\d+/, '?').split('?')
    return `${urlParts[0]}?s=${size}&${urlParts.slice(1).join('?')}`
  }
}

export default user => new AsAvatarUser(user)
