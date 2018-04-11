import HomePage from '../pages/HomePage'
import AboutModal from '../pages/AboutModal'

export default function() {
  this.Given(/^(\w+) opens the About modal$/, function(user) {
    AboutModal.open()
  })

  this.Given(/^(\w+) clicks the About nav link$/, function(user) {
    HomePage.aboutNavLink.click()
  })

  this.Given(/^(\w+) clicks Get Started on the About modal$/, function(user) {
    AboutModal.getStarted.click()
  })

  this.Given(/^(\w+) ensures the About modal is dismissed$/, function(user) {
    if (AboutModal.modal.isExisting()) {
      AboutModal.getStarted.click()
    }
  })

  this.Then(/^(\w+) should see the About modal$/, function(user) {
    AboutModal.modal.waitForVisible()
  })

  this.Then(/^(\w+) should not see the About modal$/, function(user) {
    expect(AboutModal.modal.isExisting()).toBeFalsy()
  })
}
