export class Page {
  constructor() {
    this.title = "MR3 Page"
  }

  baseURL() {
    return process.env["chimp.mr3URL"]
  }

  get app() {
    return browser.element(".App")
  }

  appIsVisible() {
    this.app.isExisting()
  }

  waitForApp() {
    this.app.waitForVisible(10000)
  }

  open(path) {
    browser.url(this.baseURL() + path)
    this.waitForApp()
  }
}
