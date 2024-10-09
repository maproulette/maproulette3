import { format } from 'date-fns'

/**
 * View changesets in OSMCha. Sets up filters for given bbox, the given start
 * date (typically the earliest relevant date in the task history), and
 * participating usernames
 */
export const viewOSMCha = (bboxArray, earliestDate, participantUsernames) => {
  window.open(buildOSMChaUrl(bboxArray, earliestDate, participantUsernames))
}

/**
 * Build OSMCha URL for the given filters
 */
export const buildOSMChaUrl = (bboxArray, earliestDate, participantUsernames) => {
  const filterParams = []

  // Setup bbox filter
  if (bboxArray) {
    const bbox = bboxArray.join(',')
    filterParams.push(`"in_bbox":[{"label":"${bbox}","value":"${bbox}"}]`)
  }

  // Setup start-date filter
  if (earliestDate) {
    const startDate = format(earliestDate, "yyyy-MM-dd")
    filterParams.push(`"date__gte":[{"label":"${startDate}","value":"${startDate}"}]`)
  }
  else {
    // OSMCha seems to want a blank date__gte rather than omitting it entirely
    filterParams.push('"date__gte":[{"label":"","value":""}]')
  }

  // Setup user filter
  if (participantUsernames && participantUsernames.length > 0) {
    const userList =
      participantUsernames.map(username => `{"label":"${username}","value":"${username}"}`)
    filterParams.push(`"users":[${userList.join(',')}]`)
  }

  return `${import.meta.env.REACT_APP_OSMCHA_SERVER}/?filters=` +
         encodeURIComponent(`{${filterParams.join(',')}}`)
}
