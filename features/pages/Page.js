export class Page {
  constructor() {
    this.title = "MR3 Page"
  }

  baseURL() {
    return process.env["chimp.mr3URL"]
  }

  waitForApp() {
    browser.waitForVisible(".App", 10000)
  }

  open(path) {
    browser.url(this.baseURL() + path)
    this.waitForApp()
  }
}
