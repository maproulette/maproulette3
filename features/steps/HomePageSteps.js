import HomePage from '../pages/HomePage'

export default function() {
  this.Given(/^(\w+) visits (MapRoulette|the site|the home page)$/, function(username, pageName) {
    HomePage.open()
  })

  this.Given(/^(\w+) is browsing MapRoulette$/, function(username) {
    if (!HomePage.appIsVisible()) {
      HomePage.open()
    }

    HomePage.waitForKnownLoginStatus()
    HomePage.getStarted.click()
  })

  this.Given(/^(\w+) opens the Account nav menu$/, function(username) {
    HomePage.waitForKnownLoginStatus()
    HomePage.accountNavMenu.click()
  })

  this.Given(/^(\w+) clicks Get Started on the home page$/, function(user) {
    HomePage.getStarted.click()
  })
}
