import AppErrors from '../Error/AppErrors'

/**
 * Retrieve the OpenStreetMap XML data with nodes/ways/relations for the given
 * WSEN (comma-separated) bounding box string
 */
export const fetchOSMData = function(bbox) {
  const osmDataURI =
    `https://api.openstreetmap.org/api/0.6/map?bbox=${bbox}`

  return new Promise((resolve, reject) => {
    fetch(osmDataURI).then(response => {
      if (response.ok) {
        response.text().then(rawXML => {
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(rawXML, "application/xml")
          resolve(xmlDoc)
        })
      }
      else if (response.status === 400) {
        reject(AppErrors.osm.requestTooLarge)
      }
      else if (response.status === 509) {
        reject(AppErrors.osm.bandwidthExceeded)
      }
    }).catch(error => {
      console.log(error)
      reject(AppErrors.osm.fetchFailure)
    })
  })
}

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
