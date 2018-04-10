import OpenStreetMap from '../pages/OpenStreetMap'

export default function() {
  this.Given(/^(\w+)\/(\w+) logs in to OpenStreetMap$/, function(username, password) {
    OpenStreetMap.open()
    OpenStreetMap.username.setValue(username)
    OpenStreetMap.password.setValue(password)
    OpenStreetMap.loginButton.click()
  })

  this.Given(/^(\w+) authorizes the Maproulette app on OpenStreetMap$/, function(user) {
    OpenStreetMap.waitForAuthorizationForm()
    OpenStreetMap.authorizeButton.click()
  })
}
