import AppErrors from '../Error/AppErrors'
import xmlToJSON from 'xmltojson'
import _get from 'lodash/get'
import _isPlainObject from 'lodash/isPlainObject'
import _transform from 'lodash/transform'
import _map from 'lodash/map'
import _each from 'lodash/each'
import _isEmpty from 'lodash/isEmpty'

const API_SERVER = process.env.REACT_APP_OSM_API_SERVER

/**
 * Retrieve the OpenStreetMap XML data with nodes/ways/relations for the given
 * WSEN (comma-separated) bounding box string
 */
export const fetchOSMData = function(bbox) {
  const osmDataURI = `${API_SERVER}/api/0.6/map?bbox=${bbox}`

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
 * Retrieve the current OpenStreetMap data for the given element `<type>/<id>`
 * string (e.g. `way/12345`), by default returning a JSON representation of
 * just the element data
 *
 * If asXML is set to true then the promise will resolve with the (parsed) XML
 * response instead, including the top-level `osm` element (normally excluded
 * from the JSON response)
 */
export const fetchOSMElement = function(idString, asXML=false) {
  const osmURI = `${API_SERVER}/api/0.6/${idString}`

  return new Promise((resolve, reject) => {
    fetch(osmURI).then(response => {
      if (response.ok) {
        response.text().then(rawXML => {
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(rawXML, "application/xml")

          if (asXML) {
            resolve(xmlDoc)
            return
          }

          const osmJSON = normalizeAttributes(xmlToJSON.parseXML(xmlDoc))
          const elementType = idString.split('/')[0]
          resolve(_get(osmJSON, `osm[0].${elementType}[0]`))
        })
      }
      else if (response.status === 400) {
        reject(AppErrors.osm.requestTooLarge)
      }
      else if (response.status === 404) {
        reject(AppErrors.osm.elementMissing)
      }
      else if (response.status === 509) {
        reject(AppErrors.osm.bandwidthExceeded)
      }
    }).catch(error => {
      if (error.id && error.defaultMessage) {
        reject(error)
      }
      else {
        console.log(error)
        reject(AppErrors.osm.fetchFailure)
      }
    })
  })
}

/**
 * Retrieve the history for the given OpenStreetMap element string (e.g.
 * `way/12345`), optionally including changeset data for each history entry as
 * well (requiring an additional API call)
 */
export const fetchOSMElementHistory = function(idString, includeChangesets=false) {
  const osmURI = `${API_SERVER}/api/0.6/${idString}/history.json`

  return new Promise((resolve, reject) => {
    if (!idString) {
      resolve(null)
    }

    fetch(osmURI).then(async response => {
      if (response.ok) {
        const history = await response.json()
        if (includeChangesets) {
          const changesetIds = _map(history.elements, 'changeset')
          const changesets = await fetchOSMChangesets(changesetIds)
          const changesetMap = new Map()
          _each(changesets, c => changesetMap.set(c.id, c))
          _each(history.elements, historyEntry => {
            if (changesetMap.has(historyEntry.changeset)) {
              historyEntry.changeset = changesetMap.get(historyEntry.changeset)
            }
          })
        }
        resolve(history.elements)
      }
      else if (response.status === 404) {
        reject(AppErrors.osm.elementMissing)
      }
      else if (response.status === 400) {
        reject(AppErrors.osm.requestTooLarge)
      }
      else if (response.status === 509) {
        reject(AppErrors.osm.bandwidthExceeded)
      }
    }).catch(error => {
      if (error.id && error.defaultMessage) {
        reject(error)
      }
      else {
        console.log(error)
        reject(AppErrors.osm.fetchFailure)
      }
    })
  })
}

/**
 * Retrieve the specified OpenStreetMap changesets
 */
export const fetchOSMChangesets = function(changesetIds) {
  const osmDataURI = `${API_SERVER}/api/0.6/changesets?changesets=${changesetIds.join(',')}`

  return new Promise((resolve, reject) => {
    fetch(osmDataURI).then(response => {
      if (response.ok) {
        response.text().then(rawXML => {
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(rawXML, "application/xml")
          const osmJSON = normalizeAttributes(xmlToJSON.parseXML(xmlDoc))
          if (!osmJSON || _isEmpty(osmJSON.osm)) {
            resolve([])
            return
          }

          resolve(osmJSON.osm[0].changeset)
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
  const osmUserURI = `${API_SERVER}/api/0.6/user/${osmUserId}`

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
 * Generates a URL to the given user's OSM profile page
 */
export const osmUserProfileURL = function(osmUsername) {
  return `${process.env.REACT_APP_OSM_SERVER}/user/${encodeURIComponent(osmUsername)}`
}

/**
 * Normalize the xmlToJSON representation of XML attributes into key/value
 * pairs that are a bit easier to use
 */
function normalizeAttributes(json) {
  if (Array.isArray(json)) {
    return json.map(value => normalizeAttributes(value))
  }

  if (!_isPlainObject(json)) {
    return json
  }

  return _transform(json, (result, value, key) => {
    if (key === '_attr') {
      Object.keys(value).forEach(attrName => {
        result[attrName] = value[attrName]['_value']
      })
    }
    else if (key !== '_text') { // Text nodes aren't used for anything meaningful
      result[key] = normalizeAttributes(value)
    }
  })
}
