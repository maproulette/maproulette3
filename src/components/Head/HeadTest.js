let _get = require('lodash/get');
let _isEmpty = require('lodash/isEmpty')

/* Unit tests for Head.js, export functions from Head.js and run tests with node HeadTest.js */
let path = '/'
let props = {
  challenge: {
    id: 1,
    name: 'challenge1'
  },
  project: {
    id: 1,
    displayName: 'project1'
  },
  match: {
    path: path,
    params: {
      'challengeId': 1,
      'projectId': 1,
      'taskId': 10,
      'countryCode': 'AL',
      'showType': 'tag'
    },
  },
  user: {
    osmProfile: {
      displayName: 'user1'
    }
  }
}
const titleTest = () => {

  const pathWithoutParams = 'browse/challenges'
  const pathWithParams = 'browse/challenge/:challengeId'

  if (findCurrentChallengeName() === 'challenge1') {
    console.log('findCurrentChallengeName succeed!')
  }
  if (findCurrentProjectName() === 'project1') {
    console.log('findCurrentProjectName succeed!')
  }
  if (findCurrentUserName() === 'user1') {
    console.log('findCurrentUserName succeed!')
  }
  if (findCurrentTaskId() === 10) {
    console.log('findCurrentTask succeed!')
  }
  if (findCurrentCountryCode() === 'AL') {
    console.log('findCurrentCountryCode succeed!')
  }
  if (findReviewType() === 'tag') {
    console.log('findReviewType succeed!')
  }
  if (pathToTitleFormat(props.match.path) === 'MapRoulette') {
    console.log('title can be generated for homepage!')
  }
  props.match.path = pathWithoutParams
  if (pathToTitleFormat(props.match.path) === 'MapRoulette-browse-challenges') {
    console.log('title can be generated for path without params!')
  }
  props.match.path = pathWithParams
  if (pathToTitleFormat(props.match.path) === 'MapRoulette-browse-challenge-challenge1') {
    console.log('title can be generated for path with params!')
  }
}
console.log(titleTest())

module.exports = 'titleTest'