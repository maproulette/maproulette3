import { isFuture, parseISO } from "date-fns";
import Endpoint from "../Server/Endpoint";
import { defaultRoutes as api } from "../Server/Server";

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
export const fetchActiveSystemNotices = () => {
  return new Endpoint(api.user.announcements)
    .execute()
    .then((response) => {
      const systemNotices = response?.message?.notices;
      if (Array.isArray(systemNotices)) {
        return systemNotices
          .map((notice) => {
            // add Date instance for expiration timestamp
            notice.expirationDate = parseISO(notice.expirationTimestamp);
            return notice;
          })
          .filter((notice) => isFuture(notice.expirationDate));
      } else {
        // Allow server admin to delete file when not in use
        return [];
      }
    })
    .catch(() => {
      return [];
    });
};
