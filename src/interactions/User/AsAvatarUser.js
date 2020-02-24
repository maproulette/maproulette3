import defaultPic from '../../static/images/user_no_image.png'

/**
 * AsAvatarUser adds functionality to a User related to a general user.
 */
export class AsAvatarUser {
  constructor(user) {
    Object.assign(this, user)
  }

  profilePic(size) {
    const urlParts = this.avatarURL.replace(/\?s=\d+/, '?').split('?')
    return /user_no_image/.test(this.avatarURL) ? defaultPic :
           `${urlParts[0]}?s=${size}&${urlParts.slice(1).join('?')}`
  }
}

export default user => new AsAvatarUser(user)
