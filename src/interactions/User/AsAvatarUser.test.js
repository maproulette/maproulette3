import AsAvatarUser from './AsAvatarUser'
import defaultPic from '../../static/images/user_no_image.png'

describe('profilePic', () => {
  it("returns default pic if user has empty avatar URL", () => {
    const user = AsAvatarUser({avatarURL: ""})
    expect(user.profilePic(200)).toEqual(defaultPic)
  })

  it("returns default pic if server is assigned default user_no_image avatar", () => {
    const user = AsAvatarUser({avatarURL: "https://maproulette.org/images/user_no_image.jpg"})
    expect(user.profilePic(200)).toEqual(defaultPic)
  })
})
