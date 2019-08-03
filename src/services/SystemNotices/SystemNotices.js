import _isEmpty from 'lodash/isEmpty'
import _isArray from 'lodash/isArray'
import parse from 'date-fns/parse'
import isFuture from 'date-fns/is_future'

const NOTICES_URL = process.env.REACT_APP_SYSTEM_NOTICES_URL

/**
 * Fetches system notices from the configured URL. Reponse is expected to be a
 * JSON object with a top-level `notices` field containing an array of notice
 * objects, each of which should contain a `message` field, ISO8601 formatted
 * `expirationTimestamp` field, and a `uuid` field that uniquely identifies the
 * notice. Any other top-level fields in the response object are ignored
 *
 * Only notices that have not yet expired are returned
 *
 * Example JSON:
 * ```
 *    {
 *      "notices": [
 *        {
 *          "message": "A first notice. Maintenance is planned.",
 *          "expirationTimestamp": "2019-08-01T17:00:00Z",
 *          "uuid": "b98da355-a5e9-44b4-8a20-a5034d704de5"
 *        },
 *        {
 *          "message": "A second notice. Important things are happening",
 *          "expirationTimestamp": "2019-08-04T15:00:00Z",
 *          "uuid": "94aef98e-bf9f-46a6-a860-85e62498ae3d"
 *        }
 *      ]
 *    }
 * ```
 */
export const fetchActiveSystemNotices = async function() {
  if (_isEmpty(NOTICES_URL)) {
    return []
  }

  const response = await fetch(NOTICES_URL)
  if (response.ok) {
    const systemNotices = await response.json()
    if (!systemNotices || !_isArray(systemNotices.notices)) {
      return []
    }

    return systemNotices.notices.map(notice => {
      // add Date instance for expiration timestamp
      notice.expirationDate = parse(notice.expirationTimestamp)
      return notice
    }).filter(notice => isFuture(notice.expirationDate))
  }
  else {
    // Allow server admin to delete file when not in use
    return []
  }
}
