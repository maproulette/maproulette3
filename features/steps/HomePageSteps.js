import HomePage from '../pages/HomePage'
import AboutModal from '../pages/AboutModal'

export default function() {
  this.Given(/^(\w+) visits (MapRoulette|the site|the home page)$/, function(username, pageName) {
    HomePage.open()
  })

  this.Given(/^(\w+) is browsing MapRoulette$/, function(username) {
    if (!HomePage.appIsVisible()) {
      HomePage.open()
    }

    HomePage.waitForKnownLoginStatus()

    if (AboutModal.modal.isExisting()) {
      AboutModal.getStarted.click()
    }
  })

  this.Given(/^(\w+) opens the Account nav menu$/, function(username) {
    HomePage.waitForKnownLoginStatus()
    HomePage.accountNavMenu.click()
  })
}
