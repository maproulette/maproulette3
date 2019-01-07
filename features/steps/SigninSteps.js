import HomePage from '../pages/HomePage'
import OpenStreetMap from '../pages/OpenStreetMap'

const logInToOpenStreetMap = function(username, password) {
  OpenStreetMap.open()
  OpenStreetMap.username.setValue(username)
  OpenStreetMap.password.setValue(password)
  OpenStreetMap.loginButton.click()
}

const authorizeMapRouletteOnOpenStreetMap = function() {
  OpenStreetMap.waitForAuthorizationForm()
  OpenStreetMap.authorizeButton.click()
}

export default function() {
  this.Given(/^(\w+) clicks the Sign In nav link$/, function(username) {
    HomePage.waitForKnownLoginStatus()
    HomePage.signinNavLink.waitForVisible(10000)
    HomePage.signinNavLink.click()
  })

  this.Given(/^(\w+)\/(\w+) logs in to OpenStreetMap$/, function(username, password) {
    logInToOpenStreetMap(username, password)
  })

  this.Given(/^(\w+) authorizes the MapRoulette app on OpenStreetMap$/, function(username) {
    authorizeMapRouletteOnOpenStreetMap()
  })

  this.Given(/^(\w+)\/(\w+) is signed in to MapRoulette$/, function(username, password) {
    HomePage.waitForKnownLoginStatus()
    if (!HomePage.isSignedIn()) {
      logInToOpenStreetMap(username, password)

      HomePage.open()
      HomePage.waitForKnownLoginStatus()
      HomePage.getStarted.click()

      if (!HomePage.isSignedIn()) {
        HomePage.signinNavLink.click()
        authorizeMapRouletteOnOpenStreetMap()
        HomePage.waitForKnownLoginStatus()
      }
    }
  })

  this.Given(/^(\w+) clicks Sign Out on the Account nav menu$/, function(username) {
    HomePage.waitForKnownLoginStatus()
    HomePage.accountNavMenu.waitForVisible(10000)

    // Ensure the account menu is open first
    if (!HomePage.activatedAccountNavMenu.isExisting()) {
      HomePage.accountNavMenu.click()
    }

    HomePage.signoutMenuOption.click()
  })

  this.Given(/^(\w+) is signed out from MapRoulette$/, function(username) {
    if (HomePage.isSignedIn()) {
      if (!HomePage.activatedAccountNavMenu.isExisting()) {
        HomePage.accountNavMenu.click()
      }

      HomePage.signoutMenuOption.click()
    }
  })

  this.Then(/^(\w+) should be signed in to MapRoulette$/, function(username) {
    HomePage.username.waitForVisible(10000)
    expect(HomePage.username.getText()).toBe(username)
  })

  this.Then(/^(\w+) should be signed out from MapRoulette$/, function(username) {
    HomePage.signinNavLink.waitForVisible(10000)
  })
}
