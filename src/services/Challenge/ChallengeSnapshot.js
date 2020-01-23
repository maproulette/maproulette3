import Endpoint from '../Server/Endpoint'
import { defaultRoutes as api } from '../Server/Server'

/**
 * Fetch challenge snapshot list for the given challenge.
 */
export const fetchChallengeSnapshotList = function(challengeId, includeAllData = false) {
  return new Endpoint(
    api.challenge.snapshotList,
    {
      schema: {},
      variables: {id: challengeId},
      params: {includeAllData}
    }
  ).execute().catch((error) => {
    console.log(error.response || error)
  })
}

/**
 * Record a challenge snapshot.
 */
export const recordChallengeSnapshot = function(challengeId) {
  return new Endpoint(
    api.challenge.recordSnapshot,
    {
      variables: {id: challengeId},
    }
  ).execute().catch((error) => {
    console.log(error.response || error)
  })
}

/**
 * Fetch challenge snapshot by id.
 */
export const fetchChallengeSnapshot = function(snapshotId) {
  return new Endpoint(
    api.challenge.snapshot,
    {
      schema: {},
      variables: {id: snapshotId},
    }
  ).execute().catch((error) => {
    console.log(error.response || error)
  })
}
