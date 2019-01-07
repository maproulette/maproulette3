import { Page } from './Page'

class HomePage extends Page {
  get getStarted() {
    return browser.element(".home-pane__view-challenges")
  }

  get aboutNavLink() {
    return browser.element(".top-nav__about-link")
  }

  get signinNavLink() {
    return browser.element(".navbar__account-nav-item__signin")
  }

  get accountNavMenu() {
    return browser.element(".navbar__account-nav-item__dropdown")
  }

  get activatedAccountNavMenu() {
    return browser.element(".navbar__account-nav-item__dropdown.is-active")
  }

  get userProfileMenuOption() {
    return browser.element(".navbar__account-nav-item .dropdown-item.profile")
  }

  get signoutMenuOption() {
    return browser.element(".navbar__account-nav-item .dropdown-item.signout")
  }

  get username() {
    return browser.element(".navbar__account-nav-item__username")
  }

  isSignedIn() {
    this.waitForKnownLoginStatus()

    return browser.element(
      ".navbar__account-nav-item.signed-in"
    ).isExisting()
  }

  waitForKnownLoginStatus() {
    browser.element(
      ".navbar__account-nav-item.login-status-known"
    ).waitForVisible(10000)
  }

  open() {
    super.open('/')
  }
}

export default new HomePage()
