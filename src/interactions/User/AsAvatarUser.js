import defaultPic from '../../static/images/user_no_image.png'

/**
 * AsAvatarUser adds functionality to a User related to a general user.
 */
export class AsAvatarUser {
  constructor(user) {
    Object.assign(this, user)
  }

  profilePic(size) {
    return /user_no_image/.test(this.avatarURL) ? defaultPic : `${this.avatarURL}?s=${size}`
  }
}

export default user => new AsAvatarUser(user)
