import _isEmpty from 'lodash/isEmpty'
import _isArray from 'lodash/isArray'
import parse from 'date-fns/parse'
import isFuture from 'date-fns/is_future'

const NOTICES_URL = process.env.REACT_APP_FUNDRAISING_NOTICES_URL

export const fetchActiveFundraisingNotices = async function () {
  // if (_isEmpty(NOTICES_URL)) {
  //   return []
  // }

  // const response = await fetch(NOTICES_URL)
  // if (response.ok) {
  //   const fundraisingNotices = await response.json()
  //   if (!fundraisingNotices || !_isArray(fundraisingNotices.notices)) {
  //     return []
  //   }

  //   return fundraisingNotices.notices
  //     .map((notice) => {
  //       // add Date instance for expiration timestamp
  //       notice.expirationDate = parse(notice.expirationTimestamp)
  //       return notice
  //     })
  //     .filter((notice) => isFuture(notice.expirationDate))
  // } else {
  //   // Allow server admin to delete file when not in use
  //   return []
  // }
  return []
}
