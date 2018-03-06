// Utility functions

/**
 * Retrieve OpenStreetMap user data for the user with the given OSM user id
 * (not the same as a MapRoulette user id). Note that this does not update the
 * redux store: it simply resolves the returned promise with the user data.
 */
export const fetchOSMUser = function(osmUserId) {
  const osmUserURI =
    `https://api.openstreetmap.org/api/0.6/user/${osmUserId}`

  // The OSM api call only returns XML, so extract the display name
  return new Promise((resolve, reject) => {
    fetch(osmUserURI).then(response => {
      if (response.ok) {
        response.text().then(xmlData => {
          const displayNameMatch = /display_name="([^"]+)"/.exec(xmlData)
          resolve({id: osmUserId, displayName: displayNameMatch[1]})
        })
      }
      else if (response.status === 404) { // No user found
        resolve({})
      }
    }).catch(error => reject(error))
  })
}

/**
 * Returns a Promise that resolves to the URL to be used for sending an
 * OpenStreetMap message to the user with the given OSM user id (not
 * MapRoulette user id).
 */
export const contactOSMUserURL = function(osmUserId) {
  return fetchOSMUser(osmUserId).then(osmUserData =>
    `https://www.openstreetmap.org/message/new/${osmUserData.displayName}`
  )
}
