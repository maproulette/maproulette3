import { Page } from './Page'

class HomePage extends Page {
  get aboutNavLink() {
    return browser.element(".top-nav__about-link")
  }

  get signinNavLink() {
    return browser.element(".navbar__account-nav-item__signin")
  }

  get username() {
    return browser.element(".navbar__account-nav-item__username")
  }

  open() {
    super.open('/')
  }
}

export default new HomePage()
