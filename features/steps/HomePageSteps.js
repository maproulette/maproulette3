import HomePage from '../pages/HomePage'
import OpenStreetMap from '../pages/OpenStreetMap'

export default function() {
  this.Given(/^(\w+) visits the (site|home page)$/, function(user, pageName) {
    HomePage.open()
  })

  this.Given(/^(\w+) clicks the About nav link$/, function(user) {
    HomePage.aboutNavLink.click()
  })

  this.Given(/^(\w+) clicks the Sign In nav link$/, function(user) {
    HomePage.signinNavLink.click()
  })

  this.Then(/^(\w+) should be logged in to Maproulette$/, function(user) {
    HomePage.username.waitForVisible(10000)
    expect(HomePage.username.getText()).toBe(user)
  })
}
