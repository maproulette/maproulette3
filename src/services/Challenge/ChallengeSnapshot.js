import Endpoint from '../Server/Endpoint'
import { defaultRoutes as api } from '../Server/Server'

/**
 * Fetch challenge snapshot list for the given challenge.
 */
export const fetchChallengeSnapshotList = async function(challengeId, includeAllData = false) {
  return await new Endpoint(
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
export const recordChallengeSnapshot = async function(challengeId) {
  return await new Endpoint(
    api.challenge.recordSnapshot,
    {
      variables: {id: challengeId},
    }
  ).execute().catch((error) => {
    console.log(error.response || error)
  })
}

/**
 * Removes a challenge snapshot.
 */
export const removeChallengeSnapshot = async function(snapshotId) {
  return await new Endpoint(
    api.challenge.removeSnapshot,
    {
      variables: {id: snapshotId},
    }
  ).execute().catch((error) => {
    console.log(error.response || error)
  })
}

/**
 * Fetch challenge snapshot by id.
 */
export const fetchChallengeSnapshot = async function(snapshotId) {
  return await new Endpoint(
    api.challenge.snapshot,
    {
      schema: {},
      variables: {id: snapshotId},
    }
  ).execute().catch((error) => {
    console.log(error.response || error)
  })
}
