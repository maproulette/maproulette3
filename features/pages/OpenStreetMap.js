import { Page } from './Page'

class OpenStreetMap extends Page {
  get username() {
    return browser.element("input#username")
  }

  get password() {
    return browser.element("input#password")
  }

  get loginButton() {
    return browser.element("#login_form input[type=submit]")
  }

  get authorizeButton() {
    return browser.element(".oauth-authorize form input[type=submit]")
  }

  waitForAuthorizationForm() {
    browser.waitForVisible(".oauth-authorize form", 10000)
  }

  open() {
    browser.url('https://www.openstreetmap.org/login')
    browser.waitForVisible("#login_form", 10000)
  }
}

export default new OpenStreetMap()
