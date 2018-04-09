import { Page } from './Page'

class AboutModal extends Page {
  constructor() {
    super()
    this.title = "About Modal"
  }

  get modal() {
    return browser.element(".about-modal")
  }

  get getStarted() {
    return browser.element(".about-modal__view-challenges")
  }
 
  open() {
    super.open('/about')
  }
}

export default new AboutModal()
