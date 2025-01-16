import { each, isPlainObject, map, transform } from "lodash";
import xmlToJSON from "xmltojson";
import AppErrors from "../Error/AppErrors";

const API_SERVER = window.env.REACT_APP_OSM_API_SERVER;

const OSM_ERRORS = {
  400: AppErrors.osm.requestTooLarge,
  404: AppErrors.osm.elementMissing,
  509: AppErrors.osm.bandwidthExceeded,
};

const handleOSMError = (response) => {
  const error = OSM_ERRORS[response.status] || AppErrors.osm.fetchFailure;
  throw error;
};

const handleFetchError = (error) => {
  console.error(error);
  if (Object.values(OSM_ERRORS).includes(error)) {
    throw error;
  } else {
    throw AppErrors.osm.fetchFailure;
  }
};

/**
 * Normalize the xmlToJSON representation of XML attributes into key/value
 * pairs that are a bit easier to use
 */
const normalizeAttributes = (json) => {
  if (Array.isArray(json)) return json.map(normalizeAttributes);
  if (!isPlainObject(json)) return json;

  return transform(json, (result, value, key) => {
    if (key === "_attr") {
      Object.assign(
        result,
        transform(
          value,
          (res, v, k) => {
            res[k] = v["_value"];
          },
          {},
        ),
      );
    } else if (key !== "_text") {
      result[key] = normalizeAttributes(value);
    }
  });
};

const fetchXMLData = async (uri) => {
  try {
    const response = await fetch(uri);
    if (response.ok) {
      const rawXML = await response.text();
      return new DOMParser().parseFromString(rawXML, "application/xml");
    } else {
      handleOSMError(response);
    }
  } catch (error) {
    handleFetchError(error);
  }
};

/**
 * Generates a URL to the given user's OSM profile page
 */
export const osmUserProfileURL = (osmUsername) => {
  return `${window.env.REACT_APP_OSM_SERVER}/user/${encodeURIComponent(osmUsername)}`;
};

/**
 * Retrieve the OpenStreetMap XML data with nodes/ways/relations for the given
 * WSEN (comma-separated) bounding box string
 */
export const fetchOSMData = async (bbox) => {
  const uri = `${API_SERVER}/api/0.6/map?bbox=${bbox}`;
  return fetchXMLData(uri);
};

/**
 * Retrieve the current OpenStreetMap data for the given element `<type>/<id>`
 * string (e.g. `way/12345`), by default returning a JSON representation of
 * just the element data
 *
 * If asXML is set to true then the promise will resolve with the (parsed) XML
 * response instead, including the top-level `osm` element (normally excluded
 * from the JSON response)
 */
export const fetchOSMElement = async (idString, asXML = false) => {
  const uri = `${API_SERVER}/api/0.6/${idString}`;
  const xmlDoc = await fetchXMLData(uri);
  if (asXML) return xmlDoc;

  const osmJSON = normalizeAttributes(xmlToJSON.parseXML(xmlDoc));
  return osmJSON?.osm?.[0]?.[idString.split("/")[0]]?.[0];
};

/**
 * Retrieve the history for the given OpenStreetMap element string (e.g.
 * `way/12345`), optionally including changeset data for each history entry as
 * well (requiring an additional API call)
 */
export const fetchOSMElementHistory = async (idString, includeChangesets = false) => {
  if (!idString) return null;

  const uri = `${API_SERVER}/api/0.6/${idString}/history.json`;
  try {
    const response = await fetch(uri);
    if (response.ok) {
      const history = await response.json();
      if (includeChangesets) {
        const changesetIds = map(history.elements, "changeset");
        const changesetMap = new Map(await fetchOSMChangesets(changesetIds));
        each(history.elements, (entry) => {
          if (changesetMap.has(entry.changeset))
            entry.changeset = changesetMap.get(entry.changeset);
        });
      }
      return history.elements;
    } else {
      handleOSMError(response);
    }
  } catch (error) {
    handleFetchError(error);
  }
};

/**
 * Retrieve the specified OpenStreetMap changesets
 */
export const fetchOSMChangesets = async (changesetIds) => {
  const uri = `${API_SERVER}/api/0.6/changesets?changesets=${changesetIds.join(",")}`;
  const xmlDoc = await fetchXMLData(uri);
  const osmJSON = normalizeAttributes(xmlToJSON.parseXML(xmlDoc));
  return osmJSON?.osm?.[0]?.changeset || [];
};

/**
 * Retrieve OpenStreetMap user data for the user with the given OSM user id
 * (not the same as a MapRoulette user id). Note that this does not update the
 * redux store: it simply resolves the returned promise with the user data.
 */
export const fetchOSMUser = async (osmUserId) => {
  const osmUserURI = `${API_SERVER}/api/0.6/user/${osmUserId}`;
  try {
    const response = await fetch(osmUserURI);
    if (response.ok) {
      const xmlData = await response.text();
      const displayNameMatch = /display_name="([^"]+)"/.exec(xmlData);
      return { id: osmUserId, displayName: displayNameMatch?.[1] || null };
    } else if (response.status === 404) {
      return {};
    } else {
      handleOSMError(response);
    }
  } catch (error) {
    handleFetchError(error);
  }
};
