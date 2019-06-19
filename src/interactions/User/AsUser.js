import defaultPic from '../../static/images/user_no_image.png'

/**
 * AsUser adds functionality to a User related to a general user.
 */
export class AsUser {
  constructor(user) {
    Object.assign(this, user)
  }

  profilePic(size) {
    return /user_no_image/.test(this.avatarURL) ? defaultPic : `${this.avatarURL}?s=${size}`
  }
}

export default user => new AsUser(user)
